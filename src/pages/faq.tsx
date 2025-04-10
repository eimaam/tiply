import * as React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { QuestionCircleOutlined, RightOutlined } from '@ant-design/icons'

const faqCategories = [
  {
    title: 'Getting Started',
    faqs: [
      {
        question: "How does Tipp Link work?",
        answer: "Tipp Link provides you with a unique, shareable link that allows you to receive tips in USDC cryptocurrency. Simply share your link on your social profiles or content platforms, and your audience can tip you without any login required."
      },
      {
        question: "Do I need cryptocurrency knowledge to use Tipp Link?",
        answer: "No prior crypto knowledge is required! For both tipper and creator, we've designed Tipp Link to be user-friendly for everyone. The platform handles all the complexity, so you can focus on creating content, receiving tips or giving tips."
      },
      {
        question: "How do I create my Tipp Link account?",
        answer: "Sign up with your email address, choose a username for your tipping link, and complete a quick verification. Your unique tipping link will be instantly created and ready to share."
      }
    ]
  },
  {
    title: 'Using Tipp Link',
    faqs: [
      {
        question: "How do I withdraw my tips?",
        answer: "You can withdraw your tips to any compatible wallet address. Simply connect your wallet or enter your wallet address in your dashboard settings, and transfer your tips with a click of a button."
      },
      {
        question: "Can I customize my tipping page?",
        answer: "Yes! You can personalize your tipping page with your profile picture, custom banner, bio, and even theme colors. Premium users have access to more advanced customization options."
      },
      {
        question: "Can I see who has tipped me?",
        answer: "Yes, our dashboard shows you all tip transactions. If tippers choose to provide their name or message, you'll see that information as well."
      }
    ]
  },
  {
    title: 'Payments & Security',
    faqs: [
      {
        question: "Are there any fees for using Tipp Link?",
        answer: "Our Free plan has minimal processing fees. Premium users enjoy reduced fees and additional features like custom branding and advanced analytics. Check our pricing page for detailed information."
      },
      {
        question: "Is Tipp Link secure?",
        answer: "Yes, security is our top priority. We implement industry-standard security practices to protect your account and funds. All transactions are processed on secure networks with encryption."
      },
      {
        question: "What happens if someone sends a tip to a wrong address?",
        answer: "Cryptocurrency transactions are irreversible. We recommend double-checking wallet addresses when making transfers. Our system uses checksums to help prevent errors when entering wallet addresses."
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
              Everything you need to know about Tipp Link
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
                
                <div className="space-y-6">
                  {category.faqs.map((faq, faqIndex) => (
                    <motion.div
                      key={faqIndex}
                      className="rounded-lg bg-brand-surface p-6 ring-1 ring-brand-border"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (categoryIndex * 0.1) + (faqIndex * 0.05) }}
                    >
                      <dt className="text-lg font-semibold leading-7 text-brand-foreground">
                        {faq.question}
                      </dt>
                      <dd className="mt-4 text-base leading-7 text-brand-muted-foreground">
                        {faq.answer}
                      </dd>
                    </motion.div>
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