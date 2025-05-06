import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { message, Tabs, Tooltip } from 'antd';
import { 
  CopyOutlined, 
  CheckCircleOutlined, 
  QrcodeOutlined, 
  LinkOutlined,
  ShareAltOutlined,
  WhatsAppOutlined,
  TwitterOutlined,
  InstagramOutlined
} from '@ant-design/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TipLinkSectionProps {
  username: string;
  className?: string;
}

export const TipLinkSection: React.FC<TipLinkSectionProps> = ({ 
  username,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('link');
  const [showQR, setShowQR] = useState(false);
  
  const tipLink = `https://usetiply.xyz/${username}`;
  
  useEffect(() => {
    // Reset copied state when changing user
    setCopied(false);
  }, [username]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(tipLink);
    setCopied(true);
    message.success('Tip link copied to clipboard! 📋');
    
    // Reset copied icon after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const toggleQRCode = () => {
    setShowQR(!showQR);
  };
  
  const shareOnSocial = (platform: string) => {
    let shareUrl = '';
    const text = `Support me with USDC tips!`;
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(tipLink)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${tipLink}`)}`;
        break;
      default:
        // Generic share dialog if available
        if (navigator.share) {
          navigator.share({
            title: 'My Tiply link',
            text: text,
            url: tipLink
          }).catch(err => console.error('Error sharing:', err));
          return;
        }
    }
    
    // Open share URL in a new window
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className={`${className}`}>
      <div className="relative overflow-hidden rounded-xl border border-brand-border bg-gradient-to-br from-brand-primary/10 via-brand-background to-purple-500/10 p-5 transition-all hover:shadow-md">
        <h3 className="text-lg font-semibold mb-3">Your Personal Tip Link</h3>
        
        <div className="flex items-center gap-2 relative z-10">
          <Input 
            value={tipLink} 
            readOnly
            className="font-mono text-sm bg-opacity-70"
          />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={copied ? 'copied' : 'copy'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant={copied ? "default" : "outline"}
                size="icon"
                onClick={copyToClipboard}
                className={`shrink-0 transition-all duration-300 ${copied ? 'bg-green-500 text-white' : ''}`}
              >
                {copied ? <CheckCircleOutlined /> : <CopyOutlined />}
              </Button>
            </motion.div>
          </AnimatePresence>
          
          <Tooltip title="Toggle QR Code">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleQRCode}
              className={`shrink-0 ${showQR ? 'bg-brand-primary/20' : ''}`}
            >
              <QrcodeOutlined />
            </Button>
          </Tooltip>
        </div>
        
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 flex flex-col items-center"
            >
              <div className="p-3 bg-white rounded-lg">
                <QRCodeSVG
                  value={tipLink}
                  size={180}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="L"
                  includeMargin={false}
                />
              </div>
              <p className="text-sm text-center mt-2 text-brand-muted-foreground">
                Scan this QR code to access your tip page
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4">
          <p className="text-sm text-brand-muted-foreground mb-2">
            Share your tip link with your audience:
          </p>
          
          <div className="flex gap-2 mt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => shareOnSocial('twitter')}
            >
              <TwitterOutlined /> Twitter
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => shareOnSocial('whatsapp')}
            >
              <WhatsAppOutlined /> WhatsApp
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => shareOnSocial('other')}
            >
              <ShareAltOutlined /> Share
            </Button>
          </div>
          
          <motion.div
            className="absolute bottom-0 right-0 opacity-10 -z-10"
            animate={{
              rotate: [0, 10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <QrcodeOutlined style={{ fontSize: '120px' }} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};