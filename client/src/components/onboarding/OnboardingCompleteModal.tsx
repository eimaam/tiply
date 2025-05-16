import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LoadingOutlined, RocketOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PoweredBySolanaIllustration from "@/assets/images/illustrations/powered-by-solana";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { FC, useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { message } from "antd";

interface OnboardingCompleteModalProps {
  username: string;
  visible: boolean;
  onClose: () => void;
}

export const OnboardingCompleteModal: FC<OnboardingCompleteModalProps> = ({
  username,
  visible,
  onClose,
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { completeOnboarding, isLoading } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
    } catch (error) {
      setIsCompleting(false);
    } finally {
      setIsCompleting(false);
    }
  };

  const [confetti, setConfetti] = useState<
    { x: number; y: number; size: number; color: string }[]
  >([]);

  // Create confetti effect when modal becomes visible
  useEffect(() => {
    if (visible) {
      const colors = ["#7B2CBF", "#5A189A", "#3C096C", "#9D4EDD", "#E0AAFF"];
      const newConfetti = Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4, // 4px to 12px
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setConfetti(newConfetti);
    }
  }, [visible, navigate]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Confetti */}
      {confetti.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          initial={{
            top: "50%",
            left: "50%",
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
          }}
          animate={{
            top: `${c.y}%`,
            left: `${c.x}%`,
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: 200,
            ease: "easeOut",
            delay: Math.random() * 0.5,
          }}
        />
      ))}

      <motion.div
        className="text-center p-10 rounded-2xl bg-brand-background/90 backdrop-blur-lg border border-brand-border shadow-lg max-w-lg w-full"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 12 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-brand-primary to-brand-accent/80 rounded-full flex items-center justify-center"
        >
          <RocketOutlined className="text-white text-4xl" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3">Your tiply is Ready! 🎉</h2>
        <p className="text-xl mb-3 text-brand-foreground">
          Start receiving tips now
        </p>

        <div className="bg-brand-surface/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-brand-border flex items-center justify-center mb-6">
          <span className="text-brand-primary font-medium">tiply.xyz/@</span>
          <span className="font-bold">{username}</span>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <Button
            variant="outline"
            className="flex gap-2"
            onClick={() => {
              navigator.clipboard.writeText(`https://tiply.xyz/@${username}`);
              message.info("Link copied to clipboard");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
            </svg>
            Copy Link
          </Button>
          {/* <Button 
            variant="outline" 
            className="flex gap-2"
            onClick={() => {
              window.open(`https://x.com/intent/tweet?text=Send me a tip on my Tiply page&url=https://tiply.xyz/@${username}`, '_blank');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
            </svg>
            Share on X
          </Button> */}
          <Button
            className="bg-gradient-to-r from-brand-primary to-brand-accent"
            disabled={isLoading}
            onClick={() => {
              if (!user?.depositWalletAddress) {
                // call the complete onboarding function
                handleComplete();
              } else {
                navigate("/dashboard");
              }
            }}
          >
            {isCompleting ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingOutlined /> Getting your dashboard ready...
              </span>
            ) : (
              "Go to Dashboard"
            )}
          </Button>
        </div>

        <div className="flex justify-center">
          <PoweredBySolanaIllustration />
        </div>
      </motion.div>
    </div>
  );
};
