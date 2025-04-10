import * as React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { RightOutlined } from '@ant-design/icons'

const faqs = [
  {
    question: "How does Tipp Link work?",
    answer: "Tipp Link provides you with a unique, shareable link that allows you to receive tips in USDC cryptocurrency. Simply share your link on your social profiles or content platforms, and your audience can tip you without any login required."
  },
  {
    question: "Do I need cryptocurrency knowledge to use Tipp Link?",
    answer: "No prior crypto knowledge is required! For both tipper and creator, we've designed Tipp Link to be user-friendly for everyone. The platform handles all the complexity, so you can focus on creating content, receiving tips or giving tips."
  },
  {
    question: "How do I withdraw my tips?",
    answer: "You can withdraw your tips to any compatible wallet address. Simply connect your wallet or enter your wallet address in your dashboard settings, and transfer your tips with a click of a button."
  },
  {
    question: "Are there any fees for using Tipp Link?",
    answer: "Our Free plan has minimal processing fees. Premium users enjoy reduced fees and additional features like custom branding and advanced analytics. Check our pricing page for detailed information."
  },
  {
    question: "Is Tipp Link secure?",
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
          <dl className="space-y-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="rounded-lg bg-brand-surface p-6 ring-1 ring-brand-border"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <dt className="text-lg font-semibold leading-7 text-brand-foreground">
                  {faq.question}
                </dt>
                <dd className="mt-4 text-base leading-7 text-brand-muted-foreground">
                  {faq.answer}
                </dd>
              </motion.div>
            ))}
          </dl>
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