export const conversations = [
  {
    id: '1',
    title: 'Job Search Strategy',
    preview: "Let's discuss your career goals...",
    time: '2m',
    icon: 'briefcase',
    active: true
  },
  {
    id: '2',
    title: 'Resume Review',
    preview: 'Your resume looks great, but I suggest...',
    time: '1h',
    icon: 'file-alt'
  },
  {
    id: '3',
    title: 'Interview Preparation',
    preview: "Let's practice some common questions...",
    time: '2d',
    icon: 'comments'
  },
  {
    id: '4',
    title: 'Skill Development',
    preview: 'Based on your interests, I recommend...',
    time: '3d',
    icon: 'graduation-cap'
  },
  {
    id: '5',
    title: 'Career Progression',
    preview: "Here's a roadmap for your career...",
    time: '1w',
    icon: 'chart-line'
  }
];

export const messages = [
  {
    id: '1',
    text: "Hello! I'm your Career Assistant. I can help you with job searches, resume reviews, interview preparation, and career advice. What would you like to discuss today?",
    sender: 'bot',
    timestamp: Date.now() - 120000
  },
  {
    id: '2',
    text: "I'm looking for job opportunities in tech. I have experience in web development.",
    sender: 'user',
    timestamp: Date.now() - 90000
  },
  {
    id: '3',
    text: "Great! I'd be happy to help you find tech job opportunities that match your web development experience. Could you tell me a bit more about:\n\n1. Your specific skills (languages, frameworks, etc.)\n2. Years of experience\n3. Location preferences (remote, specific cities)\n4. Any particular companies or industries you're interested in",
    sender: 'bot',
    timestamp: Date.now() - 60000
  },
  {
    id: '4',
    text: "I have 3 years of experience with React, Node.js, and MongoDB. I'm looking for remote positions or jobs in Boston. I'm interested in fintech or healthtech companies.",
    sender: 'user',
    timestamp: Date.now() - 30000
  },
  {
    id: '5',
    text: "Thanks for sharing those details! Based on your experience with React, Node.js, and MongoDB, along with your interest in remote or Boston-based positions in fintech or healthtech, I've found several matching opportunities.\n\nI've added some job suggestions to the canvas on the right. You can click on any job card to see more details and application instructions.\n\nWould you like me to help you prepare your application materials for these positions?",
    sender: 'bot',
    timestamp: Date.now() - 10000
  }
];

export const jobPosts = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'HealthTech Innovations',
    location: 'Remote',
    salary: '$120K - $150K',
    tags: ['React', 'TypeScript', 'Redux', 'Healthcare']
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'Boston FinTech Solutions',
    location: 'Boston, MA',
    salary: '$110K - $140K',
    tags: ['React', 'Node.js', 'MongoDB', 'Fintech']
  },
  {
    id: '3',
    title: 'MERN Stack Developer',
    company: 'Digital Health Platform',
    location: 'Remote',
    salary: '$100K - $130K',
    tags: ['MongoDB', 'Express', 'React', 'Node.js']
  },
  {
    id: '4',
    title: 'Frontend Engineer',
    company: 'WealthTech Advisors',
    location: 'Boston, MA (Hybrid)',
    salary: '$115K - $135K',
    tags: ['React', 'JavaScript', 'CSS', 'Finance']
  },
  {
    id: '5',
    title: 'Backend Developer',
    company: 'MedTech Solutions',
    location: 'Remote',
    salary: '$125K - $145K',
    tags: ['Node.js', 'MongoDB', 'Express', 'Healthcare']
  }
];

export const newsTicker = "Latest: New job postings in Tech • Career workshop tomorrow at 2 PM • Resume review services now available • 15 new companies joined our platform today";