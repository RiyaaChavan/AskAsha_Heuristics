import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, CartesianGrid, AreaChart, Area, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart
} from 'recharts';

// Enhanced sample data with more comprehensive metrics
const dashboardData = {
  queriesToday: 1247,
  weeklyActiveUsers: 3456,
  monthlyGrowth: 23.5,
  avgSessionTime: 8.3,
  successRate: 94.2,
  mostQueriedFeatures: [
    { name: 'Job Hunt', count: 2340, growth: 15 },
    { name: 'Interview Assistant', count: 1456, growth: 23 },
    { name: 'Resume Builder', count: 1123, growth: 8 },
    { name: 'Events Hub', count: 987, growth: 12 },
    { name: 'Skill Assessment', count: 756, growth: 31 }
  ],
  topJobTitles: [
    { title: 'Software Engineer', count: 456 },
    { title: 'Data Scientist', count: 342 },
    { title: 'Product Manager', count: 287 },
    { title: 'UI/UX Designer', count: 234 },
    { title: 'DevOps Engineer', count: 198 }
  ],
  guardrailStats: [
    { type: 'Bias Detection', value: 45, color: '#ff6b6b' },
    { type: 'Inappropriate Content', value: 23, color: '#feca57' },
    { type: 'Off-topic Queries', value: 18, color: '#48dbfb' },
    { type: 'Spam Detection', value: 14, color: '#ff9ff3' }
  ],
  inputTypes: [
    { type: 'Text', value: 65, trend: 5 },
    { type: 'Voice', value: 28, trend: 12 },
    { type: 'Image Upload', value: 7, trend: 23 }
  ],
  languagesUsed: [
    { lang: 'English', value: 52, users: 1798 },
    { lang: 'Hindi', value: 31, users: 1071 },
    { lang: 'Tamil', value: 9, users: 311 },
    { lang: 'Telugu', value: 5, users: 173 },
    { lang: 'Marathi', value: 3, users: 103 }
  ],
  weeklyQueries: [
    { day: 'Mon', queries: 856, users: 423, satisfaction: 4.2 },
    { day: 'Tue', queries: 923, users: 467, satisfaction: 4.3 },
    { day: 'Wed', queries: 1247, users: 598, satisfaction: 4.1 },
    { day: 'Thu', queries: 1098, users: 542, satisfaction: 4.4 },
    { day: 'Fri', queries: 1156, users: 587, satisfaction: 4.2 },
    { day: 'Sat', users: 398, queries: 756, satisfaction: 4.0 },
    { day: 'Sun', queries: 634, users: 341, satisfaction: 4.1 }
  ],
  hourlyActivity: [
    { hour: '00', activity: 12 }, { hour: '01', activity: 8 }, { hour: '02', activity: 6 },
    { hour: '03', activity: 4 }, { hour: '04', activity: 3 }, { hour: '05', activity: 7 },
    { hour: '06', activity: 25 }, { hour: '07', activity: 45 }, { hour: '08', activity: 78 },
    { hour: '09', activity: 95 }, { hour: '10', activity: 88 }, { hour: '11', activity: 92 },
    { hour: '12', activity: 85 }, { hour: '13', activity: 79 }, { hour: '14', activity: 88 },
    { hour: '15', activity: 94 }, { hour: '16', activity: 89 }, { hour: '17', activity: 86 },
    { hour: '18', activity: 72 }, { hour: '19', activity: 58 }, { hour: '20', activity: 45 },
    { hour: '21', activity: 34 }, { hour: '22', activity: 28 }, { hour: '23', activity: 18 }
  ],
  userSatisfaction: [
    { category: 'Response Quality', score: 4.3 },
    { category: 'Speed', score: 4.1 },
    { category: 'Accuracy', score: 4.4 },
    { category: 'Helpfulness', score: 4.2 },
    { category: 'Ease of Use', score: 4.5 }
  ],
  deviceStats: [
    { device: 'Mobile', percentage: 68, color: '#6c5ce7' },
    { device: 'Desktop', percentage: 28, color: '#a29bfe' },
    { device: 'Tablet', percentage: 4, color: '#fd79a8' }
  ]
};

// Modern color palette
const COLORS = {
  primary: '#924f72',   // Purple from the background
  secondary: '#87c05a', // Green from the icon
  accent: '#a76a8f',    // Lighter purple
  light: '#d19ec0',     // Very light purple
  success: '#87c05a',   // Green
  warning: '#e2b354',   // Gold
  danger: '#e17055',    // Red
  info: '#5a9ac0',      // Blue
  gradients: {
    purple: ['#924f72', '#a76a8f'],
    green: ['#87c05a', '#a5d485'],
    purpleToGreen: ['#924f72', '#87c05a'],
    greenToPurple: ['#87c05a', '#924f72']
  }
};


const Dashboard = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#924f72',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Main Content */}
      <main style={{
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { title: 'Queries Today', value: dashboardData.queriesToday.toLocaleString(), trend: '+12%', color: COLORS.primary },
            { title: 'Active Users', value: dashboardData.weeklyActiveUsers.toLocaleString(), trend: '+8%', color: COLORS.info },
            { title: 'Success Rate', value: `${dashboardData.successRate}%`, trend: '+2.1%', color: COLORS.success },
            { title: 'Avg Session', value: `${dashboardData.avgSessionTime}min`, trend: '+15%', color: COLORS.accent }
          ].map((kpi, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>{kpi.title}</p>
                  <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.5rem 0' }}>{kpi.value}</p>
                  <p style={{ color: COLORS.success, fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{kpi.trend} from last week</p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${kpi.color}, ${kpi.color}80)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {index === 0 ? '📊' : index === 1 ? '👥' : index === 2 ? '✅' : '⏱️'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* First Row - Main Activity Charts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem'
          }}>
            {/* Weekly Queries Trend */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Weekly Activity Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dashboardData.weeklyQueries}>
                  <defs>
                    <linearGradient id="queryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="queries" stroke="#6c5ce7" fill="url(#queryGradient)" strokeWidth={3} />
                  <Bar dataKey="users" fill="#a29bfe" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* User Satisfaction Radar */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                User Satisfaction
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={dashboardData.userSatisfaction}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 5]} 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6c5ce7"
                    fill="#6c5ce7"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Second Row - Feature Usage and Languages */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem'
          }}>
            {/* Most Queried Features */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Feature Usage Analytics
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.mostQueriedFeatures} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="name" type="category" stroke="#64748b" width={120} />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 8, 8, 0]}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#6c5ce7" stopOpacity={1}/>
                        <stop offset="95%" stopColor="#a29bfe" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Language Distribution */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Language Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.languagesUsed}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ lang, value }) => `${lang}: ${value}%`}
                    labelLine={false}
                  >
                    {dashboardData.languagesUsed.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.info, COLORS.success][index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Third Row - Hourly Activity and Device Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem'
          }}>
            {/* 24-Hour Activity Heatmap */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                24-Hour Activity Pattern
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dashboardData.hourlyActivity}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#74b9ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#74b9ff" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activity" 
                    stroke="#74b9ff" 
                    fill="url(#activityGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Device Statistics */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Device Usage
              </h3>
              <div style={{ height: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                {dashboardData.deviceStats.map((device, index) => (
                  <div key={index} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#64748b', fontWeight: '500' }}>{device.device}</span>
                      <span style={{ color: '#1e293b', fontWeight: '600' }}>{device.percentage}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${device.percentage}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${device.color}, ${device.color}80)`,
                        borderRadius: '4px',
                        transition: 'width 1s ease-in-out'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fourth Row - Guardrails and Input Types */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem'
          }}>
            {/* Guardrail Activations */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Safety Guardrails
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.guardrailStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {dashboardData.guardrailStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Job Titles */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Trending Job Searches
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '300px', overflow: 'auto' }}>
                {dashboardData.topJobTitles.map((job, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'rgba(108, 92, 231, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(108, 92, 231, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {index + 1}
                      </div>
                      <span style={{ color: '#1e293b', fontWeight: '500' }}>{job.title}</span>
                    </div>
                    <span style={{ 
                      color: COLORS.primary, 
                      fontWeight: '600',
                      background: 'rgba(108, 92, 231, 0.1)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem'
                    }}>
                      {job.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;