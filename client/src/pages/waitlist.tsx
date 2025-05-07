import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { message, notification } from "antd";
import {
  TwitterOutlined,
  SendOutlined,
  RocketOutlined,
  LockOutlined,
  ThunderboltOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import logo from "../assets/images/tiply-logo.png";
import { PROJECT_INFO } from "@/lib/utils";
import { generalService } from "@/services/general.service";
import Container from "@/components/ui/container";

const WaitlistPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      notification.error({
        message: "Error",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await generalService.addToWaitlist(email);

      setIsSubscribed(true);
      setEmail("");

      notification.success({
        message: "Success! 🎉",
        description:
          "You've been added to our waitlist. We'll notify you when we launch!",
      });
    } catch (error: any) {
      if (error?.response?.status === 409) {
        return notification.info({
          message: "You're already in! 🎉",
          description:
            "We've got your email already in our waitlist. Stay tuned for the exciting launch! ✨",
        });
      }
      notification.error({
        message: "Error",
        description:
          "We experienced an error while adding you to the waitlist. Please try again later. 🔄",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section - Hero/Branding */}
      <Container
        height="auto"
        className="h-full md:h-screen w-full bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 p-8 md:p-12 flex items-center justify-center relative"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 right-10 w-80 h-80 bg-brand-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-60 h-60 bg-brand-accent/20 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-md mx-auto text-center"
        >
          {/* Logo and Project Name */}
          <motion.div variants={itemVariants} className="mb-5">
            <div className="flex items-center justify-center mb-0">
              <img
                src={logo}
                alt="tiply Logo"
                className="h-20 md:h-24 w-auto"
              />
              <h1 className="text-3xl md:text-5xl font-bold">
                <span className="text-brand-primary">tiply</span>
              </h1>
            </div>
            <p className="text-lg md:text-xl mt-3 text-brand-muted-foreground">
              Simple, instant tips for creators.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Revolutionizing Creator Support ⚡
            </h2>
            <p className="text-lg text-brand-muted-foreground mb-6">
              Tipping without the Friction! Instantly get tips in USDC! <br />{" "}
              Built on <code>Solana</code> for speed and security.
            </p>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <DollarOutlined className="text-brand-primary text-xl" />
                <span>USDC tips</span>
              </div>
              <div className="flex items-center space-x-3">
                <LockOutlined className="text-brand-primary text-xl" />
                <span>No login needed</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-brand-primary">⚡</span>
                <span>Lightning fast</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-brand-primary">💬</span>
                <span>Tip messages</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <a
              href={PROJECT_INFO.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-brand-surface/80 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors py-3 px-6 rounded-full border border-brand-border"
            >
              <TwitterOutlined />
              <span>Follow @tiplyHQ for updates</span>
            </a>
          </motion.div>
        </motion.div>
      </Container>

      {/* Right Section - Waitlist Form */}
      <Container height="auto" className="md:h-screen overflow-y-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-md mx-auto w-full"
        >
          <motion.div variants={itemVariants} className="mb-10">
            <h2 className="text-center text-2xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-brand-primary to-brand-accent text-transparent bg-clip-text">
              Join Our Waitlist 🚀
            </h2>
            <p className="text-brand-muted-foreground">
              Be the first to know when we launch. Tiply's changing how creators
              get paid and how supporters show love.
            </p>
          </motion.div>

          {/* Two Column Features */}
          <motion.div variants={itemVariants} className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-surface/80 rounded-xl border border-brand-border p-5">
                <div className="flex items-start space-x-3">
                  <div className="bg-brand-primary/10 p-2 rounded-full text-brand-primary shrink-0">
                    <RocketOutlined />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">For Creators ✨</h3>
                    <p className="text-sm text-brand-muted-foreground">
                      Share a link or your tag, get tipped instantly in USDC.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-brand-surface/80 rounded-xl border border-brand-border p-5">
                <div className="flex items-start space-x-3">
                  <div className="bg-brand-primary/10 p-2 rounded-full text-brand-primary shrink-0">
                    <ThunderboltOutlined />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">For Supporters 🎯</h3>
                    <p className="text-sm text-brand-muted-foreground">
                      No login, just scan QR or connect wallet and send.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Waitlist Form */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-xl border border-brand-border p-6 backdrop-blur-sm">
              {!isSubscribed && (
                <h3 className="text-xl font-semibold mb-6">
                  Be the First to Know When We Launch! 🌟
                </h3>
              )}

              {isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-brand-primary/10 p-6 rounded-lg text-center "
                >
                  <h3 className="text-xl font-medium mb-2">
                    Thank you for joining! 🎉
                  </h3>
                  <p className="text-brand-muted-foreground">
                    We've added you to our waitlist. Keep an eye on your inbox
                    for updates as we get closer to launch.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                  <div className="!flex !flex-col gap-3 w-full">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={handleEmailChange}
                      className="flex-grow"
                      required
                    />
                    <Button
                      htmlType="submit"
                      className="flex-none"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⟳</span> Adding...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Join Waitlist <SendOutlined className="ml-2" />
                        </span>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-center text-brand-foreground">
                    We'll only email you about tiply launches and important
                    updates. No spam, promise!
                  </p>
                </form>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="pt-10 text-center text-sm text-brand-muted-foreground"
          >
            &copy; {new Date().getFullYear()} tiply. Built on Solana.
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
};

export default WaitlistPage;
