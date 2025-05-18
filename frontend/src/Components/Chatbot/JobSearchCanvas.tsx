import React, { useEffect, useState } from 'react';
import { CanvasProps } from './types';

interface JobData {
  company_name: string;
  title: string;
  location_name: string;
  skills: string[] | string;
  status: string;
  id?: number;
  company_logo?: string;
  employer_name?: string;
  min_year?: number;
  max_year?: number;
  work_mode?: string[] | string;
  job_types?: string[] | string;
  boosted?: boolean;
  expires_on?: string;
  skillMatchScore?: number; // Added skill match score property
}

interface JobDetailData {
  id: number;
  title: string;
  company_name?: string;
  location_name: string;
  requirements: string;
  responsibilities: string;
  description: string;
  company_benefits: string;
  min_year: number;
  max_year: number;
  skills: string[] | string;
  status: string;
  company?: {
    name: string;
    logo: string;
    about_us: string;
    culture: string;
  }
  work_mode?: string[] | string;
  job_types?: string[] | string;
  url?: string;
  company_logo?: string;
  skillMatchScore?: number; // Add skill match score for job details
}

interface JobResponse {
  response_code: number;
  message: string;
  pagination: {
    page_no: string;
    page_size: string;
    pages: number;
    total_items: number;
    has_next: boolean;
    next_page: number;
  };
  body: JobData[];
}

// We'll keep the interface even if not directly used as it documents the API structure
interface JobDetailResponse {
  response_code: number;
  message: string;
  body: JobDetailData[];
  seo?: {
    id: number;
    entity_id: number;
    entity_type: string;
    title: string;
    description: string;
    keywords: string;
    url: string;
  }
}

const JobSearchCanvas: React.FC<CanvasProps> = ({ message }) => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [jobDetail, setJobDetail] = useState<JobDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  // These state variables are used in the code even if TypeScript doesn't detect it
  const [jobUrl, setJobUrl] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string | null>(null);

  // Work mode options for filtering
  const workModeOptions = [
    { value: "", label: "All Work Modes" },
    { value: "work_from_office", label: "Work from Office" },
    { value: "work_from_home", label: "Work from Home" },
    { value: "hybrid", label: "Hybrid" },
    { value: "freelance", label: "Freelance" }
  ];
  // Function to calculate skill match score for a job (0-100%)
  const calculateSkillMatchScore = (jobSkills: string[] | string | undefined, userSkills: string[] = []): number => {
    if (!jobSkills || userSkills.length === 0) return 0;
    
    // Normalize job skills to array
    const normalizedJobSkills = Array.isArray(jobSkills) 
      ? jobSkills 
      : jobSkills.split(',').map(s => s.trim().toLowerCase());
    
    // Normalize user skills to lowercase
    const normalizedUserSkills = userSkills.map(s => s.trim().toLowerCase());
    
    // Count matching skills
    const matchingSkills = normalizedJobSkills.filter(skill => 
      normalizedUserSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
    );
    
    // Calculate match percentage (based on job skills)
    return Math.round((matchingSkills.length / normalizedJobSkills.length) * 100);
  };

  useEffect(() => {
    // First check if we have job_results provided directly from backend
    if (message.canvasUtils?.job_results && Array.isArray(message.canvasUtils.job_results)) {
      // Get user skills from resume data if available
      const userSkills: string[] = message.canvasUtils.resumeData?.skills || [];
      
      // Add skill match score to each job
      const scoredJobs = message.canvasUtils.job_results.map(job => ({
        ...job,
        skillMatchScore: calculateSkillMatchScore(job.skills, userSkills)
      }));
      
      // Sort jobs by skill match score (highest first)
      const sortedJobs = [...scoredJobs].sort((a, b) => 
        (b.skillMatchScore || 0) - (a.skillMatchScore || 0)
      );
      
      setJobs(sortedJobs);
      setFilteredJobs(sortedJobs);
      return;
    }
    
    // If no job_results, try to fetch jobs using job_link and token
    const fetchJobs = async () => {
      if (!message.canvasUtils?.job_link) return;
      
      setLoading(true);
      setError(null);

      try {
        // Get the session ID from provided token or fetch a new one
        let sessionId = message.canvasUtils?.job_api;
        
        if (!sessionId) {
          const sessionResponse = await fetch('https://api-prod.herkey.com/api/v1/herkey/generate-session');
          const sessionData = await sessionResponse.json();
          
          if (!sessionData.success) {
            throw new Error('Failed to get authorization token');
          }
          
          sessionId = sessionData.body.session_id;
        }
        
        setSessionId(sessionId);
        
        // Now fetch the jobs with the authorization header
        const jobResponse = await fetch(message.canvasUtils.job_link, {
          headers: {
            'Authorization': `Token ${sessionId}`
          }
        });
        
        const jobData: JobResponse = await jobResponse.json();
        console.log('Job Data:', jobResponse, jobData);
        if (jobData.response_code !== 10100) {
          throw new Error(`API Error: ${jobData.message}`);
        }
          // Filter out expired jobs
        const currentDate = new Date();
        const validJobs = jobData.body.filter(job => {
          // If job has an expires_on field, check if it's still valid
          if (job.expires_on) {
            const expiryDate = new Date(job.expires_on);
            return expiryDate > currentDate;
          }
          return true; // If no expiry date, include the job
        });
        
        // Get user skills from resume data if available
        const userSkills: string[] = message.canvasUtils.resumeData?.skills || [];
        
        // Add skill match score to each job
        const scoredJobs = validJobs.map(job => ({
          ...job,
          skillMatchScore: calculateSkillMatchScore(job.skills, userSkills)
        }));
        
        // Sort jobs by skill match score (highest first)
        const sortedJobs = [...scoredJobs].sort((a, b) => 
          (b.skillMatchScore || 0) - (a.skillMatchScore || 0)
        );
        
        setJobs(sortedJobs);
        setFilteredJobs(sortedJobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [message.canvasUtils]);

  // Apply work mode filter when selectedWorkMode changes or jobs change
  useEffect(() => {
    if (selectedWorkMode) {
      const filtered = jobs.filter(job => {
        const workModes = ensureArray(job.work_mode);
        return workModes.some(mode => 
          mode.toLowerCase() === selectedWorkMode.toLowerCase()
        );
      });
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [selectedWorkMode, jobs]);

  // Handle filter selection
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedWorkMode(value === "" ? null : value);
  };

  const fetchJobDetail = async (jobId: number) => {
    // Reset error and set loading state
    setError(null);
    setLoadingDetail(true);
    
    try {
      // Always get a fresh session ID for job details to avoid 403 errors
      const sessionResponse = await fetch('https://api-prod.herkey.com/api/v1/herkey/generate-session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.body?.session_id) {
        throw new Error('Failed to get authorization token');
      }
      
      // Use the fresh session ID
      const freshSessionId = sessionData.body.session_id;
      setSessionId(freshSessionId);
      
      // Fetch job details using the job ID and fresh session ID
      const detailResponse = await fetch(`https://api-prod.herkey.com/api/v1/herkey/jobs/jobs/${jobId}`, {
        headers: {
          'Authorization': `Token ${freshSessionId}`
        }
      });
      
      // Check if the HTTP request was successful
      if (!detailResponse.ok) {
        throw new Error(`Failed to fetch job details: ${detailResponse.status} ${detailResponse.statusText}`);
      }
      
      const detailData = await detailResponse.json();
      console.log('Job Detail Data:', detailData);
      
      // Check if we have valid job data, regardless of the response_code
      if (detailData.body && detailData.body.length > 0) {
        setJobDetail(detailData.body[0]);
        
        // Extract URL information
        if (detailData.seo?.url) {
          setJobUrl(detailData.seo.url);
        } else {
          // Set a fallback URL format if no SEO URL is available
          setJobUrl(`jobs/${jobId}`);
        }
      } else {
        // Create a meaningful error if no job data is returned
        const errorMessage = detailData.message || 'No job details found';
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Failed to fetch job details:", err);
      
      // Set a user-friendly error message
      setError(err instanceof Error ? err.message : 'Failed to fetch job details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleJobSelect = (jobId: number) => {
    setSelectedJobId(jobId);
    fetchJobDetail(jobId);
  };

  const handleCloseDetail = () => {
    setSelectedJobId(null);
    setJobDetail(null);
  };
  
  if (!message.canvasUtils) return null;
  
  const handleOpenJobLink = () => {
    try {
      // When a specific job is selected
      if (selectedJobId && jobDetail) {
        // Format the job title for URL (lowercase, replace spaces with hyphens)
        const formattedTitle = jobDetail.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
          .replace(/\s+/g, '-'); // Replace spaces with hyphens
        
        // Use the correct URL format as shown in the example
        window.open(`https://www.herkey.com/jobs/${formattedTitle}/${selectedJobId}`, '_blank');
      } 
      // Fallback to general jobs page if no specific job is selected
      else if (message.canvasUtils?.job_link) {
        // Use the provided job_link if available, or fallback to jobs search page
        const jobsLink = message.canvasUtils.job_link.includes('http') 
          ? message.canvasUtils.job_link 
          : 'https://www.herkey.com/jobs/search';
        
        window.open(jobsLink, '_blank');
      }
    } catch (error) {
      console.error("Error opening job link:", error);
      // Fallback if all else fails
      window.open('https://www.herkey.com/jobs/search', '_blank');
    }
  };

  const formatHTMLContent = (content: string) => {
    return { __html: content };
  };

  // Function to truncate HTML content to a reasonable length
  const truncateHTMLContent = (content: string, maxLength: number = 300) => {
    if (!content) return '';
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Get the text content
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Truncate if necessary
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
      // Return simplified HTML with truncated text
      return `<p>${text}</p>`;
    }
    
    // If it's already short enough, return as is
    return content;
  };

  const renderExperience = (min: number, max: number) => {
    if (min === max) return `${min} years`;
    return `${min} - ${max} years`;
  };

  // Helper functions to safely handle arrays or strings
  const ensureArray = (value: string[] | string | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  const formatJobType = (type: string): string => {
    return type.replace(/_/g, ' ');
  };
  
  return (
    <div className="canvas-panel job-search-canvas">
      <div className="canvas-header">
        <h3>Job Search Results</h3>
      </div>
      
      {loading && (
        <div className="loading">
          <div className="loading-text">Loading job results...</div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <a 
            href={message.canvasUtils.job_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="error-link"
          >
            Try viewing jobs directly
          </a>
        </div>
      )}
      
      {!loading && !error && jobs.length === 0 && (
        <div className="no-results">
          <p>No job results found.</p>
          <a 
            href={message.canvasUtils.job_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="error-link"
          >
            Try viewing jobs directly
          </a>
        </div>
      )}
      
      {selectedJobId && loadingDetail && (
        <div className="job-detail-panel">
          <div className="job-detail-header">
            <button 
              className="back-button"
              onClick={handleCloseDetail}
            >
              ← Back to results
            </button>
          </div>
          
          <div className="loading">
            <div className="loading-text">Loading job details...</div>
          </div>
        </div>
      )}
      
      {selectedJobId && jobDetail && !loadingDetail && (
        <div className="job-detail-panel">
          <div className="job-detail-header">
            <button 
              className="back-button"
              onClick={handleCloseDetail}
            >
              ← Back to results
            </button>
          </div>
          
          <div className="job-detail-content">
            {(jobDetail.company_logo || (jobDetail.company && jobDetail.company.logo)) && (
              <div className="company-logo">
                <img 
                  src={jobDetail.company_logo || (jobDetail.company && jobDetail.company.logo)} 
                  alt={`${jobDetail.company_name || jobDetail.company?.name || 'Company'} logo`} 
                />
              </div>
            )}
              <h2 className="job-detail-title">{jobDetail.title}</h2>
            <div className="job-detail-company">{jobDetail.company_name || jobDetail.company?.name}</div>
            
            {/* Skill match indicator for selected job */}
            {jobDetail.skillMatchScore !== undefined && jobDetail.skillMatchScore > 0 && (
              <div className="job-detail-match">
                <h4>Skill Match</h4>
                <div className="detail-match-container">
                  <div className="detail-match-progress">
                    <div 
                      className="detail-match-bar" 
                      style={{
                        width: `${jobDetail.skillMatchScore}%`, 
                        backgroundColor: jobDetail.skillMatchScore > 70 ? '#4caf50' : 
                                       jobDetail.skillMatchScore > 40 ? '#ff9800' : '#f44336'
                      }}
                    />
                  </div>
                  <div className="detail-match-percentage">{jobDetail.skillMatchScore}%</div>
                </div>
                {jobDetail.skillMatchScore >= 80 && <div className="match-note">Your skills are an excellent match for this position!</div>}
                {jobDetail.skillMatchScore >= 50 && jobDetail.skillMatchScore < 80 && <div className="match-note">Your skills are a good match for this position.</div>}
                {jobDetail.skillMatchScore < 50 && <div className="match-note">You may need to develop additional skills for this role.</div>}
              </div>
            )}
            
            <div className="job-detail-meta">
              <div className="job-detail-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#7f8c8d"/>
                </svg>
                {jobDetail.location_name}
              </div>
              
              <div className="job-detail-experience">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="#7f8c8d"/>
                </svg>
                {renderExperience(jobDetail.min_year, jobDetail.max_year)} experience
              </div>

              {jobDetail.job_types && (
                <div className="job-detail-type">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#7f8c8d"/>
                  </svg>
                  {ensureArray(jobDetail.job_types).map(formatJobType).join(', ')}
                </div>
              )}

              {jobDetail.work_mode && (
                <div className="job-detail-work-mode">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v-2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="#7f8c8d"/>
                  </svg>
                  {ensureArray(jobDetail.work_mode).map(formatJobType).join(', ')}
                </div>
              )}
            </div>            
            {jobDetail.skills && (
              <div className="job-detail-skills">
                <h4>Required Skills</h4>
                <div className="skill-tags">
                  {ensureArray(jobDetail.skills).join(',').split(',').map((skill, i) => {
                    const userSkills = message.canvasUtils.resumeData?.skills || [];
                    const isMatch = userSkills.some(userSkill => 
                      userSkill.toLowerCase().includes(skill.trim().toLowerCase()) || 
                      skill.trim().toLowerCase().includes(userSkill.toLowerCase())
                    );
                    
                    return (
                      <span 
                        key={i} 
                        className={`skill-tag ${isMatch ? 'skill-match' : ''}`}
                        title={isMatch ? "You have this skill in your resume" : ""}
                      >
                        {skill.trim()}
                        {isMatch && (
                          <span className="skill-check">✓</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {jobDetail.description && (
              <div className="job-detail-section">
                <h4>Job Description</h4>
                <div 
                  className="job-detail-description" 
                  dangerouslySetInnerHTML={formatHTMLContent(truncateHTMLContent(jobDetail.description))} 
                />
              </div>
            )}

            {jobDetail.responsibilities && (
              <div className="job-detail-section">
                <h4>Responsibilities</h4>
                <div 
                  className="job-detail-responsibilities" 
                  dangerouslySetInnerHTML={formatHTMLContent(jobDetail.responsibilities)} 
                />
              </div>
            )}

            {jobDetail.requirements && (
              <div className="job-detail-section">
                <h4>Requirements</h4>
                <div 
                  className="job-detail-requirements" 
                  dangerouslySetInnerHTML={formatHTMLContent(jobDetail.requirements)} 
                />
              </div>
            )}

            {jobDetail.company_benefits && (
              <div className="job-detail-section">
                <h4>Benefits</h4>
                <div 
                  className="job-detail-benefits" 
                  dangerouslySetInnerHTML={formatHTMLContent(jobDetail.company_benefits)} 
                />
              </div>
            )}

            {jobDetail.company?.about_us && (
              <div className="job-detail-section">
                <h4>About {jobDetail.company_name || jobDetail.company?.name}</h4>
                <div 
                  className="job-detail-company-about" 
                  dangerouslySetInnerHTML={formatHTMLContent(jobDetail.company.about_us)} 
                />
              </div>
            )}            {jobDetail.skillMatchScore !== undefined && jobDetail.skillMatchScore < 60 && (
              <div className="job-detail-section skill-recommendations">
                <h4>Skill Development Recommendations</h4>
                <p>To improve your chances for this role, consider developing these skills:</p>
                <div className="skill-recommendation-list">
                  {ensureArray(jobDetail.skills)
                    .join(',')
                    .split(',')
                    .filter(skill => {
                      const userSkills = message.canvasUtils.resumeData?.skills || [];
                      const isMatch = userSkills.some(userSkill => 
                        userSkill.toLowerCase().includes(skill.trim().toLowerCase()) || 
                        skill.trim().toLowerCase().includes(userSkill.toLowerCase())
                      );
                      return !isMatch && skill.trim();
                    })
                    .slice(0, 5)
                    .map((skill, i) => (
                      <div key={i} className="skill-recommendation-item">
                        <span className="skill-recommendation-name">{skill.trim()}</span>
                        <a 
                          href={`https://www.herkey.com/learn/${encodeURIComponent(skill.trim())}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="learn-skill-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Learn more
                        </a>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
            
            <button 
              className="apply-button" 
              onClick={handleOpenJobLink}
            >
              Apply for this Job
            </button>
          </div>
        </div>
      )}
      
      {!selectedJobId && !loading && !error && jobs.length > 0 && (
        <>
          <div className="filter-dropdown">
            <label htmlFor="work-mode-filter">Filter by: </label>
            <select 
              id="work-mode-filter" 
              value={selectedWorkMode || ""}
              onChange={handleFilterChange}
              className="filter-select"
            >
              {workModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {filteredJobs.length === 0 && (
            <div className="no-filter-results">
              <p>No jobs match the selected filter.</p>
              <button 
                className="clear-filter-button"
                onClick={() => setSelectedWorkMode(null)}
              >
                Clear Filter
              </button>
            </div>
          )}
          
          <div className="job-list">
            {filteredJobs.map((job, index) => (              <div 
                key={index} 
                className="job-card job-card-compact" 
                onClick={() => job.id && handleJobSelect(job.id)}
                data-match-score={
                  job.skillMatchScore >= 70 ? "high" : 
                  job.skillMatchScore >= 40 ? "medium" : 
                  job.skillMatchScore > 0 ? "low" : "none"
                }
              >
                {job.company_logo && (
                  <div className="job-logo">
                    <img 
                      src={job.company_logo} 
                      alt={`${job.company_name} logo`} 
                      className="company-logo-img" 
                    />
                  </div>
                )}
                
                <h4 className="job-title">{job.title}</h4>
                <div className="job-company">{job.company_name}</div>
                <div className="job-location">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#7f8c8d"/>
                  </svg>
                  {job.location_name}
                </div>

                {job.min_year && job.max_year && (
                  <div className="job-experience">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="#7f8c8d"/>
                    </svg>
                    {renderExperience(job.min_year, job.max_year)}
                  </div>
                )}

                {job.work_mode && (
                  <div className="job-work-mode">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v-2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="#7f8c8d"/>
                    </svg>
                    {ensureArray(job.work_mode).map(formatJobType).join(', ')}
                  </div>
                )}
                  {job.skills && (
                  <div className="job-skills">
                    {ensureArray(job.skills).slice(0, 2).map((skill, i) => (
                      <span key={i} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {ensureArray(job.skills).length > 2 && (
                      <span className="skill-tag more-skills">
                        +{ensureArray(job.skills).length - 2}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Display skill match score if available */}
                {job.skillMatchScore !== undefined && job.skillMatchScore > 0 && (
                  <div className="skill-match-score">
                    <div className="match-label">Match score:</div>
                    <div className="match-progress">
                      <div 
                        className="match-bar" 
                        style={{
                          width: `${job.skillMatchScore}%`, 
                          backgroundColor: job.skillMatchScore > 70 ? '#4caf50' : 
                                         job.skillMatchScore > 40 ? '#ff9800' : '#f44336'
                        }}
                      />
                    </div>
                    <div className="match-percentage">{job.skillMatchScore}%</div>
                  </div>
                )}
                
                <div className="job-status">
                  {job.status}
                  {job.boosted && <span className="boosted-badge">Featured</span>}
                  {job.skillMatchScore !== undefined && job.skillMatchScore >= 80 && (
                    <span className="skill-match-badge">Top Match</span>
                  )}
                </div>
                
                <div className="job-actions">
                  <button 
                    className="job-view-button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      job.id && handleJobSelect(job.id);
                    }}
                  >
                    View Details
                  </button>
                  
                  <button 
                    className="job-apply-button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (job.id) {
                        // Format the job title for URL (lowercase, replace spaces with hyphens)
                        const formattedTitle = job.title
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
                          .replace(/\s+/g, '-'); // Replace spaces with hyphens
                        
                        // Use the correct URL format as shown in the example
                        window.open(`https://www.herkey.com/jobs/${formattedTitle}/${job.id}`, '_blank');
                      }
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}

          </div>
        </>
      )}
    </div>
  );
};

export default JobSearchCanvas;