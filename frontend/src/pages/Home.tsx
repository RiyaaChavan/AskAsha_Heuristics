import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Home.css';

// Define props interface with proper typing
interface HomeProps {
  onGetStarted: () => void; // Function that takes no arguments and returns nothing
}

export default function Home({ onGetStarted }: HomeProps) {
    const navigate = useNavigate();

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { when: "beforeChildren", staggerChildren: 0.2, duration: 0.5 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    const buttonVariants = {
        idle: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95 }
    };

    const handleGetStarted = () => {
        // First trigger the loading
        onGetStarted();

        // After 2 seconds, navigate to jobsearch (the loading will be handled in App.js)
        setTimeout(() => {
            navigate('/profile-setup');
        }, 2000);
    };

    return (
        <div className="home-container">
            <motion.div
                className="main-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Left Section */}
                <motion.div
                    className="left-section"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="logo-container" variants={itemVariants}>
                        <h2 className="logo-text">
                            <motion.div
                                className="logo-circle"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                            >
                                AA
                            </motion.div>
                            AskAsha
                        </h2>
                    </motion.div>

                    <div className="content-container">
                        <motion.h1 className="main-heading" variants={itemVariants}>
                            Connect, Learn, <br /> Grow Together
                        </motion.h1>
                        <motion.p className="main-description" variants={itemVariants}>
                            Join our community of professionals and expand your network.
                            Access exclusive events and opportunities tailored just for you.
                        </motion.p>
                        <motion.div className="tags-container" variants={itemVariants}>
                            {["Sessions", "Jobs", "Companies", "Events"].map((item, index) => (
                                <motion.span
                                    key={index}
                                    className="tag"
                                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                                >
                                    {item}
                                </motion.span>
                            ))}
                        </motion.div>
                    </div>

                    {/* Animated Background Circles */}
                    <motion.div
                        className="bg-circle-pink"
                        animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="bg-circle-purple"
                        animate={{ x: [0, -20, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut", delay: 2 }}
                    />
                </motion.div>

                {/* Right Section - Simplified with just Get Started button */}
                <motion.div
                    className="right-section"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h2
                        className="welcome-heading"
                        variants={itemVariants}
                    >
                        Welcome to AskAsha
                    </motion.h2>

                    <motion.p className="description" variants={itemVariants}>
                        Your AI-powered career companion that helps you connect with opportunities
                        and grow professionally.
                    </motion.p>

                    <motion.button
                        onClick={handleGetStarted} // Use the updated handler
                        className="get-started-button"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Get Started
                    </motion.button>

                    <motion.p className="terms-text" variants={itemVariants}>
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </motion.p>
                </motion.div>
            </motion.div>
        </div>
    );
}

