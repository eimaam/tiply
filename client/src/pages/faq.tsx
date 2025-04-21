import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { QuestionCircleOutlined, RightOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import { cn } from '@/lib/utils'

const faqCategories = [
  {
    title: 'Getting Started',
    faqs: [
      {
        question: "How does tiply work?",
        answer: "tiply provides you with a unique, shareable link that allows you to receive tips in USDC cryptocurrency. Simply share your link on your social profiles or content platforms, and your audience can tip you without any login required."
      },
      {
        question: "Do I need cryptocurrency knowledge to use tiply?",
        answer: "No prior crypto knowledge is required! For both tipper and creator, we've designed tiply to be user-friendly for everyone. The platform handles all the complexity, so you can focus on creating content, receiving tips or giving tips."
      },
      {
        question: "How do I create my tiply account?",
        answer: "Click the 'Get Started' button, follow our simple onboarding process, and you'll have your personalized tip link in minutes. We'll guide you through setting up your wallet and customizing your profile."
      }
    ]
  },
  {
    title: 'Using tiply',
    faqs: [
      {
        question: "How do I withdraw my tips?",
        answer: "You can withdraw your tips to any compatible wallet address. Simply connect your wallet or enter your wallet address in your dashboard settings, and transfer your tips with a click of a button."
      },
      {
        question: "How do I share my tip link?",
        answer: "Your unique tip link can be shared anywhere online - social media profiles, video descriptions, newsletters, or your website. Just copy your link and paste it wherever you connect with your audience."
      },
      {
        question: "Can I customize how my tip page looks?",
        answer: "Yes! You can add a profile photo, customize your background, add a short bio, and set suggested tip amounts. Premium users get access to additional customization options including custom branding and themes."
      },
      {
        question: "Do tips expire if not claimed?",
        answer: "No, tips sent to your account remain there until you withdraw them. There's no expiration date, and you can withdraw your earnings at any time."
      }
    ]
  },
  {
    title: 'Payments & Security',
    faqs: [
      {
        question: "Are there any fees for using tiply?",
        answer: "Our Free plan has minimal processing fees. Premium users enjoy reduced fees and additional features like custom branding and advanced analytics. Check our pricing page for detailed information."
      },
      {
        question: "Is tiply secure?",
        answer: "Yes, security is our top priority. We implement industry-standard security practices to protect your account and funds. All transactions are processed on secure networks with encryption."
      },
      {
        question: "What happens if someone sends a tip to a wrong address?",
        answer: "Cryptocurrency transactions are irreversible. We recommend double-checking wallet addresses when making transfers. Our system uses checksums to help prevent errors when entering wallet addresses."
      },
      {
        question: "How can I withdraw my earnings to my bank account?",
        answer: "Currently, withdrawals are made to cryptocurrency wallets only. We're adding direct bank withdrawal functionality in our next update, which will allow creators to transfer their earnings directly to their bank accounts without needing to use a third-party exchange."
      }
    ]
  },
  {
    title: 'Account & Support',
    faqs: [
      {
        question: "How do I upgrade to Premium?",
        answer: "Log into your dashboard, navigate to the 'Billing' section, and select the Premium plan. Follow the prompts to complete your subscription, and you'll instantly get access to all Premium features."
      },
      {
        question: "Can I change my username?",
        answer: "Yes, you can change your username from your account settings page. Keep in mind that this will change your tipping link URL, so you'll need to update anywhere you've shared your previous link."
      },
      {
        question: "How can I get help if I have a problem?",
        answer: "We offer support through our help center, email, and live chat for Premium users. Visit our Contact page to get in touch with our support team."
      }
    ]
  }
]

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <motion.div 
      className="mb-4 overflow-hidden rounded-lg bg-brand-surface ring-1 ring-brand-border hover:bg-brand-surface/80 transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-brand-foreground">{question}</span>
        <span className="text-brand-primary">
          {isOpen ? <UpOutlined /> : <DownOutlined />}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-base leading-7 text-brand-muted-foreground">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function FAQPage() {
  return (
    <div className="min-h-screen bg-brand-background">
      <Navbar />
      
      <main className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-brand-foreground sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-6 text-lg leading-8 text-brand-muted-foreground">
              Everything you need to know about tiply
            </p>
          </motion.div>

          <div className="mt-16 sm:mt-20">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div 
                key={category.title}
                className="mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <h2 className="text-2xl font-bold text-brand-foreground mb-8 flex items-center gap-3">
                  <QuestionCircleOutlined className="text-brand-primary" /> {category.title}
                </h2>
                
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <FAQItem 
                      key={faqIndex}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-brand-foreground mb-6">Still have questions?</h3>
            <Link to="/contact">
              <Button className="flex items-center mx-auto gap-2">
                Contact our support team <RightOutlined />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}