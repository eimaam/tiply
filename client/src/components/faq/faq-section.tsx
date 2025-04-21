import * as React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { RightOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import { Collapse } from 'antd'

const { Panel } = Collapse;

const faqs = [
  {
    question: "How does tiply work?",
    answer: "tiply provides you with a unique, shareable link that allows you to receive tips in USDC cryptocurrency. Simply share your link on your social profiles or content platforms, and your audience can tip you without any login required."
  },
  {
    question: "Do I need cryptocurrency knowledge to use tiply?",
    answer: "No prior crypto knowledge is required! For both tipper and creator, we've designed tiply to be user-friendly for everyone. The platform handles all the complexity, so you can focus on creating content, receiving tips or giving tips."
  },
  {
    question: "How do I withdraw my tips?",
    answer: "You can withdraw your tips to any compatible wallet address. Simply connect your wallet or enter your wallet address in your dashboard settings, and transfer your tips with a click of a button."
  },
  {
    question: "Are there any fees for using tiply?",
    answer: "No, tips sent to your account remain there until you withdraw them. There's no expiration date, and you can withdraw your earnings at any time."
  },
  {
    question: "Is tiply secure?",
    answer: "Yes, security is our top priority. We implement industry-standard security practices to protect your account and funds. All transactions are processed on secure networks with encryption."
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24 sm:py-32 bg-brand-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-brand-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-6 text-lg leading-8 text-brand-muted-foreground">
            Got questions? We've got answers.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-16 max-w-2xl sm:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Collapse 
            bordered={false}
            expandIconPosition="end"
            className="bg-transparent"
            expandIcon={({ isActive }) => (
              isActive ? <UpOutlined className="text-brand-primary" /> : <DownOutlined className="text-brand-muted-foreground" />
            )}
          >
            {faqs.map((faq, index) => (
              <Panel
                key={index}
                header={
                  <span className="text-lg font-semibold leading-7 text-brand-foreground">
                    {faq.question}
                  </span>
                }
                className="mb-4 rounded-lg bg-brand-surface ring-1 ring-brand-border hover:bg-brand-surface/80 transition-colors"
              >
                <div className="text-base leading-7 text-brand-muted-foreground pb-2">
                  {faq.answer}
                </div>
              </Panel>
            ))}
          </Collapse>
          
          <div className="mt-10 flex justify-center">
            <Link to="/faq">
              <Button variant="outline" className="flex items-center gap-2">
                View all FAQs <RightOutlined />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}