import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Footer } from '../components/landing/footer';
import { ArrowLeftOutlined, HomeOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 404,
  title = "Page Not Found",
  message = "Oops! The page you're looking for doesn't exist."
}) => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
      <main className="flex flex-col items-center justify-center w-full min-h-screen">
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div 
              initial="hidden"
              animate="show"
              variants={containerVariants}
              className="text-center max-w-3xl mx-auto"
            >
              {/* Error Code */}
              <motion.div 
                variants={itemVariants}
                className="relative mb-8 inline-block"
              >
                <span className="text-9xl font-bold !tracking-wider text-brand-muted/30">
                  {statusCode}
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent text-transparent bg-clip-text tracking-wide">
                    {statusCode}
                  </span>
                </div>
              </motion.div>
              
              {/* Title & Message */}
              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-brand-primary to-brand-accent text-transparent bg-clip-text"
              >
                {title}
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl text-brand-muted-foreground mb-10"
              >
                {message}
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <ArrowLeftOutlined />
                  Go Back
                </Button>
                
                <Button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-2"
                >
                  <HomeOutlined />
                  Back to Home
                </Button>
                
                <Button
                  onClick={() => navigate('/faq')}
                  variant="ghost"
                  className="flex items-center justify-center gap-2"
                >
                  <QuestionCircleOutlined />
                  Help & FAQ
                </Button>
              </motion.div>
              
              {/* Illustration */}
              <motion.div
                variants={itemVariants}
                className="mt-16 relative"
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-brand-primary/20 filter blur-3xl opacity-70"></div>
                <motion.div 
                  className="relative z-10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    duration: 0.5,
                    delay: 0.2,
                    ease: [0.175, 0.885, 0.32, 1.275] 
                  }}
                >
                  <div className="w-40 h-40 mx-auto relative mb-8">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-primary/20 to-brand-accent/20 animate-pulse"></div>
                    <div className="absolute inset-4 bg-brand-surface rounded-full flex items-center justify-center text-4xl">
                      😕
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
  );
};

export default ErrorPage;