import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { smoothScrollTo } from '@/lib/utils'
import PoweredBySolanaIllustration from '@/assets/images/illustrations/powered-by-solana'
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined, ArrowRightOutlined } from '@ant-design/icons'
import debounce from 'lodash.debounce'
import { message } from 'antd'
import { publicApi } from '@/lib/api'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function Hero() {
  const navigate = useNavigate();
  
  // Function to handle smooth scrolling to the How It Works section
  const scrollToHowItWorks = () => {
    smoothScrollTo('how-it-works');
  };

  const [username, setUsername] = React.useState('');
  const [isAvailable, setIsAvailable] = React.useState<boolean | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const [claimInProgress, setClaimInProgress] = React.useState(false);
  
  const usernameRegex = /^[a-z0-9_]+$/;

  // Check if username is valid
  const isValidUsername = (username: string) => {
    if (!username || username.length < 3) return false;
    return usernameRegex.test(username);
  };

  // Debounce username availability check
  const checkUsernameAvailability = React.useCallback(
    debounce(async (username: string) => {
      if (!isValidUsername(username)) {
        setIsAvailable(null);
        return;
      }
      
      setIsChecking(true);
      try {
        // Make real API call to check username availability
        const response = await publicApi.get(`/auth/check-username/${username}`);
        setIsAvailable(response.data?.data?.available ?? false);
      } catch (error: any) {
        console.error('Error checking username availability:', error);
        // If the error is 409 Conflict, username is taken
        if (error.response?.status === 409) {
          setIsAvailable(false);
        } else {
          // For other errors, reset the check
          setIsAvailable(null);
          message.error('Could not check username availability');
        }
      } finally {
        setIsChecking(false);
      }
    }, 500),
    []
  );

  // Handle username input change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase();
    // Only allow a-z, 0-9, and underscore
    if (value === '' || usernameRegex.test(value)) {
      setUsername(value);
    }
  };

  // Check username availability when the input changes
  React.useEffect(() => {
    if (username) {
      checkUsernameAvailability(username);
    } else {
      setIsAvailable(null);
    }
  }, [username, checkUsernameAvailability]);

  // Handle claim button click
  const handleClaim = () => {
    if (!isAvailable || !username || isChecking) return;
    
    setClaimInProgress(true);
    
    // Store the reserved username in localStorage for the onboarding flow
    localStorage.setItem('reservedUsername', username);
    
    // Navigate to signup page
    navigate('/signup');
    
    // Show success message
    message.success(`Username @${username} has been reserved for you! Sign up to claim!`);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <motion.div
          className="text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <h1 className="text-4xl font-bold tracking-tight text-brand-foreground sm:text-6xl">
            <span className="text-brand-primary">Support Creators </span> or <span className="text-brand-primary">Receive Tips</span> — Instantly ⚡
          </h1>
          
          <motion.p 
            variants={item}
            className="mx-auto mt-6 max-w-2xl text-lg text-brand-muted-foreground"
          >
            Just a link. No logins. Creators get paid in <b>USDC</b> 💰. Supporters give effortlessly. 
            <span className="block mt-2">It's tipping without the friction — powered by Solana.</span>
          </motion.p>
          
          <motion.div 
            variants={item}
            className="mt-10 flex flex-col md:flex-row gap-4 items-center justify-center gap-x-6"
          >
            <Link to="/signup">
              <Button size="lg">Create Your tiply</Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={scrollToHowItWorks}
            >
              See How It Works
            </Button>
          </motion.div>
          
          {/* Username claim section */}
          <motion.div
            variants={item}
            className="mt-14 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-brand-surface/30 to-brand-surface/10 backdrop-blur-sm dark:from-brand-surface/80 dark:to-brand-surface/60 shadow-xl rounded-2xl border border-brand-border dark:border-brand-primary/20">
              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-16 w-40 h-40 bg-brand-accent/20 rounded-full blur-3xl"></div>
              
              <div className="relative p-8">
                <h3 className="text-lg md:text-2xl font-bold text-brand-foreground mb-2 flex items-center">
                  <span className="text-brand-primary mr-2">@</span>
                  Claim Your tiply Tag
                </h3>
                <p className="text-brand-muted-foreground mb-6">
                  Reserve your username now and start receiving tips instantly.
                </p>
                
                <div className="relative">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-brand-muted-foreground group-focus-within:text-brand-primary transition-colors">
                        tiply.xyz/
                      </div>
                      <Input
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        className="pl-[5.5rem] w-full h-12 bg-brand-surface/50 dark:bg-brand-muted/10 border-brand-border dark:border-brand-muted/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl transition-all"
                        placeholder="yourusername"
                        autoComplete="off"
                        maxLength={20}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        {isChecking && <LoadingOutlined className="text-brand-muted-foreground animate-spin" />}
                        {isAvailable === true && <CheckCircleFilled className="text-green-500" />}
                        {isAvailable === false && <CloseCircleFilled className="text-red-500" />}
                      </div>
                    </div>
                    <Button 
                      className="h-12 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
                      disabled={!isAvailable || !username || isChecking || claimInProgress}
                      onClick={handleClaim}
                    >
                      <span className="mr-1 font-medium">
                        {claimInProgress ? 'Claiming...' : 'Claim'}
                      </span>
                      {!claimInProgress && <ArrowRightOutlined />}
                      {claimInProgress && <LoadingOutlined />}
                    </Button>
                  </div>
                  
                  <div className="min-h-[24px] mt-2">
                    {isAvailable === false && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500"
                      >
                        This username is already taken. Try another one.
                      </motion.p>
                    )}
                    
                    {isAvailable === true && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-green-500 flex items-center"
                      >
                        <CheckCircleFilled className="mr-1" /> Available! Click claim to reserve it.
                      </motion.p>
                    )}
                    
                    {username && !isValidUsername(username) && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-amber-500"
                      >
                        Username must be at least 3 characters (letters, numbers, underscores only).
                      </motion.p>
                    )}
                    
                    {!username && (
                      <p className="text-xs text-brand-muted-foreground">
                        Choose a username with at least 3 characters (a-z, 0-9, _).
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Example usernames */}
                <div className="mt-5 pt-5 border-t border-brand-border/30 flex flex-wrap gap-2 justify-center">
                  <p className="w-full text-xs text-brand-muted-foreground text-center mb-2">Try these:</p>
                  {['artist', 'creator', 'musician', 'streamer', 'coach'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => username !== suggestion && setUsername(suggestion)} 
                      className={`text-xs px-3 py-1.5 rounded-full border ${
                        username === suggestion 
                          ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/30' 
                          : 'bg-brand-surface/50 hover:bg-brand-surface text-brand-muted-foreground border-brand-border/50 hover:border-brand-muted/30'
                      } transition-all`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            variants={item}
            className="mt-16 flex justify-center"
          >
            <a 
              href="https://solana.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <PoweredBySolanaIllustration />
            </a>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.primary/0.1),transparent)]" />
    </div>
  )
}