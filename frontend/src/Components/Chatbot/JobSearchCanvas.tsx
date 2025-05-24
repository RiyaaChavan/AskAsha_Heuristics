import React, { useEffect, useState } from 'react';
import { CanvasProps } from './types';

// Standardized job data structure that works across different job platforms
interface JobData {
  id: number | string;
  title: string;
  company_name: string;
  location_name: string;
  skills: string[] | string;
  status: string;
  company_logo?: string;
  min_year?: number;
  max_year?: number;
  work_mode?: string[] | string;
  job_types?: string[] | string;
  boosted?: boolean;
  expires_on?: string;
  skillMatchScore?: number;
  platform?: string; // Added platform identifier (herkey, linkedin, indeed, etc.)
  platform_job_url?: string; // URL to view job on the platform
}

// Standardized job detail data structure
interface JobDetailData {
  id: number | string;
  title: string;
  company_name: string;
  location_name: string;
  requirements?: string;
  responsibilities?: string;
  description?: string;
  company_benefits?: string;
  min_year?: number;
  max_year?: number;
  skills: string[] | string;
  status: string;
  company?: {
    name: string;
    logo: string;
    about_us?: string;
    culture?: string;
  }
  work_mode?: string[] | string;
  job_types?: string[] | string;
  url?: string;
  company_logo?: string;
  skillMatchScore?: number;
  platform?: string; // Added platform identifier
  platform_job_url?: string; // URL to view job on the platform
}

// Platform-specific icons component
const PlatformIcon: React.FC<{ platform: string, size?: number }> = ({ platform, size = 16 }) => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="platform-icon">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" fill="#0077B5"/>
        </svg>
      );
    case 'glassdoor':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="platform-icon">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="#0CAA41"/>
        </svg>
      );
    case 'herkey':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="platform-icon">
          <circle cx="12" cy="12" r="10" fill="#F0386B"/>
          <path d="M12 7V13M12 17V16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="platform-icon">
          <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" fill="#999999"/>
        </svg>
      );
  }
};

const JobSearchCanvas: React.FC<CanvasProps> = ({ message }) => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | string | null>(null);
  const [jobDetail, setJobDetail] = useState<JobDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

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
    if (!message.canvasUtils) return;
    
    // Check if we have job_results provided directly from backend
    if (message.canvasUtils.job_results && Array.isArray(message.canvasUtils.job_results)) {
      setLoading(true);
      
      try {
        // Get user skills from resume data if available
        const userSkills: string[] = message.canvasUtils.resumeData?.skills || [];
        
        // Process jobs data - standardize and add skill match scores
        const processedJobs = message.canvasUtils.job_results.map((job: any) => {
          // Add platform if not already provided
          const platform = job.platform || message.canvasUtils?.platform || "herkey";
          
          // Create standardized job data
          const standardizedJob: JobData = {
            id: job.id,
            title: job.title,
            company_name: job.company_name,
            location_name: job.location_name,
            skills: job.skills,
            status: job.status || "Active",
            company_logo: job.company_logo,
            min_year: job.min_year,
            max_year: job.max_year,
            work_mode: job.work_mode,
            job_types: job.job_types,
            boosted: job.boosted,
            expires_on: job.expires_on,
            platform,
            platform_job_url: job.platform_job_url || job.url,
            // Calculate skill match score if not already provided
            skillMatchScore: job.skillMatchScore || calculateSkillMatchScore(job.skills, userSkills)
          };
          
          return standardizedJob;
        });
        
        // First sort by skill match score
        const matchSortedJobs = [...processedJobs].sort((a, b) => 
          (b.skillMatchScore || 0) - (a.skillMatchScore || 0)
        );
        
        // Then prioritize Herkey jobs - give Herkey jobs a significant boost
        const platformSortedJobs = [...matchSortedJobs].sort((a, b) => {
          // If both are Herkey or both are not Herkey, maintain the skill match order
          if ((a.platform === 'herkey' && b.platform === 'herkey') || 
              (a.platform !== 'herkey' && b.platform !== 'herkey')) {
            return 0; // Keep existing order
          }
          // Put Herkey jobs first
          return a.platform === 'herkey' ? -1 : 1;
        });
        
        setJobs(platformSortedJobs);
        setFilteredJobs(platformSortedJobs);
      } catch (err) {
        console.error("Error processing job data:", err);
        setError("Failed to process job data");
      } finally {
        setLoading(false);
      }
    } else {
      setError("No job results available");
    }
  }, [message.canvasUtils]);

  // Apply work mode filter when selectedWorkMode changes or jobs change
  useEffect(() => {
    let filtered = jobs;
    
    // Apply work mode filter
    if (selectedWorkMode) {
      filtered = filtered.filter(job => {
        const workModes = ensureArray(job.work_mode);
        return workModes.some(mode => 
          mode.toLowerCase() === selectedWorkMode.toLowerCase()
        );
      });
    }
    
    // Apply platform filter
    if (selectedPlatform) {
      filtered = filtered.filter(job => 
        job.platform?.toLowerCase() === selectedPlatform.toLowerCase()
      );
    }
    
    setFilteredJobs(filtered);
  }, [selectedWorkMode, selectedPlatform, jobs]);

  // Handle filter selection
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedWorkMode(value === "" ? null : value);
  };

  const fetchJobDetail = async (jobId: number | string) => {
    // Find the job in our current data first
    const job = jobs.find(job => job.id === jobId);
    if (!job) {
      setError("Job details not found");
      return;
    }
    
    // Reset error and set loading state
    setError(null);
    setLoadingDetail(true);
    
    try {
      // If job detail is already in the job data, use it
      if (message.canvasUtils?.job_details && Array.isArray(message.canvasUtils.job_details)) {
        const detailFromBackend = message.canvasUtils.job_details.find(
          (detail: any) => detail.id === jobId
        );
        
        if (detailFromBackend) {
          // Add platform information if not provided
          detailFromBackend.platform = detailFromBackend.platform || job.platform || message.canvasUtils?.platform || "herkey";
          detailFromBackend.platform_job_url = detailFromBackend.platform_job_url || detailFromBackend.url || job.platform_job_url;
          setJobDetail(detailFromBackend);
          setLoadingDetail(false);
          return;
        }
      }
      
      // If we don't have pre-loaded job details, create a basic one from the job data
      const basicJobDetail: JobDetailData = {
        id: job.id,
        title: job.title,
        company_name: job.company_name,
        location_name: job.location_name,
        skills: job.skills,
        status: job.status,
        min_year: job.min_year || 0,
        max_year: job.max_year || 0,
        company_logo: job.company_logo,
        work_mode: job.work_mode,
        job_types: job.job_types,
        skillMatchScore: job.skillMatchScore,
        platform: job.platform || message.canvasUtils?.platform || "herkey",
        platform_job_url: job.platform_job_url
      };
      
      setJobDetail(basicJobDetail);
      
      // Signal that detailed information is incomplete
      setError("Limited job details available");
    } catch (err) {
      console.error("Failed to fetch job details:", err);
      setError("Failed to fetch job details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleJobSelect = (jobId: number | string) => {
    setSelectedJobId(jobId);
    fetchJobDetail(jobId);
  };

  const handleCloseDetail = () => {
    setSelectedJobId(null);
    setJobDetail(null);
    setError(null);
  };
  
  const handleOpenJobLink = () => {
    try {
      // When a specific job is selected
      if (selectedJobId && jobDetail) {
        // Check if we have a platform_job_url
        if (jobDetail.platform_job_url) {
          window.open(jobDetail.platform_job_url, '_blank');
          return;
        }
        
        // Fallback to platform-specific URL format
        const platform = jobDetail.platform || "herkey";
        
        switch (platform.toLowerCase()) {
          case "herkey":
            // Format the job title for URL (lowercase, replace spaces with hyphens)
            const formattedTitle = jobDetail.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
              .replace(/\s+/g, '-'); // Replace spaces with hyphens
            
            window.open(`https://www.herkey.com/jobs/${formattedTitle}/${selectedJobId}`, '_blank');
            break;
            
          case "linkedin":
            window.open(`https://www.linkedin.com/jobs/view/${selectedJobId}`, '_blank');
            break;
            
          case "glassdoor":
            window.open(`https://www.glassdoor.com/job-listing/job.htm?jobListingId=${selectedJobId}`, '_blank');
            break;
            
          default:
            // Generic fallback for unknown platforms
            window.open(`https://www.herkey.com/jobs/search`, '_blank');
        }
      } else {
        // Fallback to job search page
        window.open('https://www.herkey.com/jobs/search', '_blank');
      }
    } catch (error) {
      console.error("Error opening job link:", error);
      // Fallback
      window.open('https://www.herkey.com/jobs/search', '_blank');
    }
  };

  const formatHTMLContent = (content: string) => {
    return { __html: content || '' };
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

  const renderExperience = (min: number = 0, max: number = 0) => {
    if (min === 0 && max === 0) return "Not specified";
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
  
  // Function to get platform name for display
  const getPlatformName = (platform: string = "herkey"): string => {
    switch (platform.toLowerCase()) {
      case "herkey": return "Herkey";
      case "linkedin": return "LinkedIn";
      case "indeed": return "Indeed";
      case "glassdoor": return "Glassdoor";
      case "monster": return "Monster";
      case "dice": return "Dice";
      case "ziprecruiter": return "ZipRecruiter";
      default: return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };
  
  // Get user skills safely
  const getUserSkills = (): string[] => {
    if (message.canvasUtils?.resumeData?.skills && Array.isArray(message.canvasUtils.resumeData.skills)) {
      return message.canvasUtils.resumeData.skills;
    }
    return [];
  };
  
  // Add this function to handle platform filter changes
  const handlePlatformChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedPlatform(value === "" ? null : value);
  };

  // Define platformStyles object
  const platformStyles = {
    linkedin: {
      primary: '#0077B5',
      secondary: '#E6F7FF',
      text: '#ffffff'
    },
    glassdoor: {
      primary: '#0CAA41',
      secondary: '#E6F7EC',
      text: '#ffffff'
    },
    herkey: {
      primary: '#F0386B',
      secondary: '#FFF1F5',
      text: '#ffffff'
    },
    default: {
      primary: '#999999',
      secondary: '#f0f0f0',
      text: '#333333'
    }
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
      
      {error && !loadingDetail && !selectedJobId && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
      
      {!loading && !error && jobs.length === 0 && (
        <div className="no-results">
          <p>No job results found.</p>
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
            {jobDetail.company_logo && (
              <div className="company-logo">
                <img 
                  src={jobDetail.company_logo} 
                  alt={`${jobDetail.company_name || 'Company'} logo`} 
                />
              </div>
            )}
            
            <h2 className="job-detail-title">{jobDetail.title}</h2>
            <div className="job-detail-company">{jobDetail.company_name}</div>
            
            {/* Platform badge */}
            {jobDetail.platform && (
              <div className="job-platform-badge" style={{
                backgroundColor: platformStyles[jobDetail.platform.toLowerCase() as keyof typeof platformStyles]?.secondary || '#f0f0f0',
                border: `1px solid ${platformStyles[jobDetail.platform.toLowerCase() as keyof typeof platformStyles]?.primary || '#ccc'}`,
                borderRadius: '4px',
                padding: '8px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 0 16px 0'
              }}>
                {/* <PlatformIcon platform={jobDetail.platform} size={24} /> */}
                {/* <span className="platform-name" style={{ 
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  {getPlatformName(jobDetail.platform)}
                </span> */}
              </div>
            )}
            
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
                    const userSkills = getUserSkills();
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
                <h4>About {jobDetail.company_name}</h4>
                <div 
                  className="job-detail-company-about" 
                  dangerouslySetInnerHTML={formatHTMLContent(jobDetail.company.about_us)} 
                />
              </div>
            )}
            
            {jobDetail.skillMatchScore !== undefined && jobDetail.skillMatchScore < 60 && (
              <div className="job-detail-section skill-recommendations">
                <h4>Skill Development Recommendations</h4>
                <p>To improve your chances for this role, consider developing these skills:</p>
                <div className="skill-recommendation-list">
                  {ensureArray(jobDetail.skills)
                    .join(',')
                    .split(',')
                    .filter(skill => {
                      const userSkills = getUserSkills();
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
          <div className="filter-container" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '12px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div className="filter-dropdown" style={{ marginRight: '10px' }}>
              <label htmlFor="platform-filter" style={{ fontWeight: 'bold', marginRight: '8px' }}>Platform: </label>
              <select 
                id="platform-filter" 
                value={selectedPlatform || ""}
                onChange={handlePlatformChange}
                className="filter-select"
                style={{ 
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  minWidth: '150px'
                }}
              >
                <option value="">All Platforms</option>
                {Array.from(new Set(jobs.map(job => job.platform || "herkey"))).map(platform => (
                  <option key={platform} value={platform}>
                    {getPlatformName(platform)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-dropdown">
              <label htmlFor="work-mode-filter" style={{ fontWeight: 'bold', marginRight: '8px' }}>Work Mode: </label>
              <select 
                id="work-mode-filter" 
                value={selectedWorkMode || ""}
                onChange={handleFilterChange}
                className="filter-select"
                style={{ 
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  minWidth: '150px'
                }}
              >
                {workModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedPlatform && (
            <div className="platform-info-banner" style={{
              padding: '8px 16px',
              marginBottom: '16px',
              backgroundColor: platformStyles[selectedPlatform.toLowerCase() as keyof typeof platformStyles]?.secondary || '#f0f0f0',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <PlatformIcon platform={selectedPlatform} size={20} />
              <span style={{ fontWeight: 'bold' }}>
                Showing jobs from {getPlatformName(selectedPlatform)}
              </span>
              <button
                onClick={() => setSelectedPlatform(null)}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                Show all platforms
              </button>
            </div>
          )}
          
          {jobs.some(job => job.platform === 'herkey') && !selectedPlatform && (
            <div className="herkey-jobs-heading" style={{
              padding: '8px 16px',
              marginBottom: '16px',
              backgroundColor: '#FFF1F5',
              borderLeft: '4px solid #F0386B',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <PlatformIcon platform="herkey" size={20} />
              <span style={{ fontWeight: 'bold' }}>
                Herkey Jobs
              </span>
            </div>
          )}
          
          {filteredJobs.length === 0 && (
            <div className="no-filter-results">
              <p>No jobs match the selected filters.</p>
              <button 
                className="clear-filter-button"
                onClick={() => {
                  setSelectedWorkMode(null);
                  setSelectedPlatform(null);
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
          
          <div className="job-list">
            {filteredJobs.map((job, index) => {
              // Check if this is a platform change in the list
              const isFirstPlatformJob = index === 0 || 
                                        (job.platform !== filteredJobs[index - 1].platform && 
                                        !selectedPlatform);
              
              // Special styles for Herkey jobs
              const isHerkeyJob = job.platform === 'herkey';
              
              return (
                <React.Fragment key={index}>
                  {/* Add platform heading for first job of each platform (only when not filtered) */}
                  {isFirstPlatformJob && !selectedPlatform && job.platform && job.platform !== 'herkey' && (
                    <div className="platform-jobs-heading" style={{
                      padding: '8px 16px',
                      marginTop: index > 0 ? '24px' : '0',
                      marginBottom: '16px',
                      backgroundColor: platformStyles[job.platform.toLowerCase() as keyof typeof platformStyles]?.secondary || '#f0f0f0',
                      borderLeft: `4px solid ${platformStyles[job.platform.toLowerCase() as keyof typeof platformStyles]?.primary || '#ccc'}`,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <PlatformIcon platform={job.platform} size={20} />
                      <span style={{ fontWeight: 'bold' }}>
                        {getPlatformName(job.platform)} Jobs
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className={`job-card job-card-compact ${isHerkeyJob ? 'herkey-job' : ''}`}
                    onClick={() => job.id && handleJobSelect(job.id)}
                    data-match-score={
                      job.skillMatchScore && job.skillMatchScore >= 70 ? "high" : 
                      job.skillMatchScore && job.skillMatchScore >= 40 ? "medium" : 
                      job.skillMatchScore && job.skillMatchScore > 0 ? "low" : "none"
                    }
                    data-platform={job.platform || "herkey"}
                    style={{
                      borderLeft: `4px solid ${platformStyles[job.platform?.toLowerCase() as keyof typeof platformStyles]?.primary || '#ccc'}`,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isHerkeyJob ? '0 2px 8px rgba(240, 56, 107, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      marginBottom: '16px'
                    }}
                  >
                    {/* Platform corner ribbon with improved visibility */}
                    <div 
                      className="platform-ribbon" 
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        width: '50px',
                        height: '50px',
                        overflow: 'hidden',
                        pointerEvents: 'none',
                        zIndex: 1
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '-20px',
                        width: '80px',
                        backgroundColor: platformStyles[job.platform?.toLowerCase() as keyof typeof platformStyles]?.primary || '#ccc',
                        color: '#fff',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '10px',
                        transform: 'rotate(45deg)',
                        padding: '2px 0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {job.platform?.toUpperCase() || 'HERKEY'}
                      </div>
                    </div>
                    
                    {job.company_logo && (
                      <div className="job-logo">
                        <img 
                          src={job.company_logo} 
                          alt={`${job.company_name} logo`} 
                          className="company-logo-img" 
                        />
                      </div>
                    )}
                    
                    {/* Enhanced platform badge with more prominence */}
                    {job.platform && (
                      <div className="job-platform-badge-small" style={{
                        backgroundColor: platformStyles[job.platform.toLowerCase() as keyof typeof platformStyles]?.secondary || '#f0f0f0',
                        color: '#333',
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        {/* <PlatformIcon platform={job.platform} size={16} />
                        <span className="platform-name">{getPlatformName(job.platform)}</span> */}
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

                    {job.min_year !== undefined && job.max_year !== undefined && (
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
                        className={`job-apply-button ${job.platform?.toLowerCase()}`}
                        style={{
                          backgroundColor: job.platform && platformStyles[job.platform.toLowerCase() as keyof typeof platformStyles]?.primary
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (job.id) {
                            if (job.platform_job_url) {
                              window.open(job.platform_job_url, '_blank');
                            } else {
                              // Use platform-specific URL format as fallback
                              const platform = job.platform || "herkey";
                              
                              switch (platform.toLowerCase()) {
                                case "herkey":
                                  // Format the job title for URL
                                  const formattedTitle = job.title
                                    .toLowerCase()
                                    .replace(/[^\w\s-]/g, '')
                                    .replace(/\s+/g, '-');
                                  window.open(`https://www.herkey.com/jobs/${formattedTitle}/${job.id}`, '_blank');
                                  break;
                                  
                                case "linkedin":
                                  window.open(`https://www.linkedin.com/jobs/view/${job.id}`, '_blank');
                                  break;
                                  
                                case "glassdoor":
                                  window.open(`https://www.glassdoor.com/job-listing/job.htm?jobListingId=${job.id}`, '_blank');
                                  break;
                                  
                                default:
                                  window.open(`https://www.herkey.com/jobs/search`, '_blank');
                              }
                            }
                          }
                        }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default JobSearchCanvas;