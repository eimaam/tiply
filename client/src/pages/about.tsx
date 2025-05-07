import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import logo from '@/assets/images/tiply-logo.png'
import PoweredBySolanaIllustration from '@/assets/images/illustrations/powered-by-solana'
import { Image } from 'antd'

const teamMembers = [
  {
    name: 'Imam Dahir Dan-Azumi',
    role: 'Founder & Developer',
    bio: 'Software Engineer, Artifical Intelligence & Blockchain Enthusiast with a nagging passion for crafting elegant, innovative and high-performance products that solve real problems.',
    imageSrc: "https://firebasestorage.googleapis.com/v0/b/myportfolio-1b84c.appspot.com/o/portrait.jpg?alt=media&token=3036c095-967f-4b48-a676-f6f6e7d52ce2"
  }
]

const AboutUsPage = () => {
  return (
    <div className="min-h-screen ">
      <Navbar />
      <main className="pt-10 pb-20">
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold tracking-tight mb-8">About tiply</h1>
            
              <div className="prose prose-lg max-w-none">
                <h2>Our Mission</h2>
                <p>
                  At tiply, we believe in empowering creators to monetize their work without friction. We're dedicated to building tools that make it simple for creators to receive support and for fans to show appreciation through micropayments.
                </p>
              </div>
              
              <div className="flex justify-center mb-10">
                <div className="h-1 w-20 bg-brand-primary rounded"></div>
              </div>
              
              <p className="mx-auto max-w-2xl text-lg leading-8 text-brand-muted-foreground">
                Born in a hackathon, built for the future. We're reimagining how creators receive support
                in a Web3 world. 🚀
              </p>
            </motion.div>
          </div>
          
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.primary/0.1),transparent)]"></div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="order-2 md:order-1">
                <h2 className="text-3xl font-bold text-brand-foreground mb-6">
                  From Hackathon to Horizon ✨
                </h2>
                <p className="text-brand-muted-foreground mb-4">
                  <code>tiply</code> began as an ambitious hackathon project with a simple yet powerful idea: what if we could eliminate 
                  all the friction from supporting digital creators?
                </p>
                <p className="text-brand-muted-foreground mb-4">
                  As Web3 enthusiasts, we recognized that blockchain technology offered the perfect solution - 
                  instant, borderless payments without requiring complex onboarding processes.
                </p>
                <p className="text-brand-muted-foreground">
                  What started as a weekend project quickly evolved into something 
                  more as we realized the vast potential to transform how creators monetize their work and 
                  connect with supporters worldwide.
                </p>
              </div>
              
              <div className="order-1 md:order-2 flex justify-center">
                <div className="bg-brand-surface p-1 rounded-lg ring-1 ring-brand-border max-w-sm">
                  <div className="aspect-square relative overflow-hidden rounded-md bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 p-8 flex items-center justify-center"
                      title="Click to enlarge"
                  
                  >
                    <Image 
                      src={logo} 
                      alt="tiply Origins" 
                      className="w-3/4 h-auto transform hover:scale-105 transition-transform"
                      title="Click to enlarge"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <p className="text-sm text-brand-muted-foreground">The original concept sketch</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-brand-surface/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-brand-foreground">
                Our Core Values 💎
              </h2>
              <p className="mt-4 text-lg text-brand-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we build and every decision we make
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🔍',
                  title: 'Simplicity',
                  description: 'We relentlessly eliminate friction and complexity. Every feature must be intuitive and accessible to everyone, regardless of technical expertise.'
                },
                {
                  icon: '🔐',
                  title: 'Security',
                  description: 'Built on Solana\'s secure blockchain, we ensure that every transaction is safe, transparent, and immutable. Your money and data are always protected.'
                },
                {
                  icon: '🌐',
                  title: 'Global Accessibility',
                  description: 'We\'re building a borderless solution that works for creators everywhere, bypassing traditional payment barriers and financial systems.'
                }
              ].map((value, index) => (
                <motion.div 
                  key={index}
                  className="bg-brand-surface p-8 rounded-xl ring-1 ring-brand-border"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-brand-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-brand-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h2 className="text-3xl font-bold text-brand-foreground mb-6">
                  The Future of tiply 🚀
                </h2>
                <p className="text-brand-muted-foreground mb-4">
                  While we're proud of what we've built for the hackathon, our vision extends far beyond. We see tiply becoming the
                  universal standard for supporting digital creators in the Web3 era.
                </p>
                <p className="text-brand-muted-foreground mb-4">
                  We're building towards a platform that will integrate seamlessly with all major content platforms, 
                  social media networks, and creative communities.
                </p>
                <p className="text-brand-muted-foreground mb-6">
                  Our roadmap includes enhanced personalization, expanded token support, creator communities, 
                  and innovative monetization tools that haven't even been imagined yet.
                </p>
                
                <div className="p-4 bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 rounded-lg border border-brand-border">
                  <p className="italic text-brand-foreground">
                    "We believe that supporting creators shouldn't require complex technology, barriers/hassles or multiple accounts. 
                    It should be as simple as clicking a link!"
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <motion.div 
                  className="bg-brand-surface p-6 rounded-xl ring-1 ring-brand-border"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h3 className="text-xl font-semibold text-brand-foreground mb-2">
                    Phase 1: Foundation ⚙️
                  </h3>
                  <ul className="list-disc list-inside text-brand-muted-foreground space-y-1">
                    <li>Core tipping functionality</li>
                    <li>USDC support on Solana</li>
                    <li>Simple, shareable links</li>
                    <li>Basic analytics</li>
                  </ul>
                </motion.div>
                
                <motion.div 
                  className="bg-brand-surface p-6 rounded-xl ring-1 ring-brand-border"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <h3 className="text-xl font-semibold text-brand-foreground mb-2">
                    Phase 2: Growth 🌱
                  </h3>
                  <ul className="list-disc list-inside text-brand-muted-foreground space-y-1">
                    <li>Creator profiles and customization</li>
                    <li>Subscription model</li>
                    <li>Social media integrations</li>
                    <li>Advanced analytics</li>
                    <li>Direct bank withdrawals</li>
                  </ul>
                </motion.div>
                
                <motion.div 
                  className="bg-brand-surface p-6 rounded-xl ring-1 ring-brand-border"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <h3 className="text-xl font-semibold text-brand-foreground mb-2">
                    Phase 3: Expansion 🌍
                  </h3>
                  <ul className="list-disc list-inside text-brand-muted-foreground space-y-1">
                    <li>Creator communities</li>
                    <li>Platform API</li>
                    <li>Mobile app</li>
                    <li>Enterprise solutions</li>
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-brand-surface/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-brand-foreground">
                Meet the Team 👋
              </h2>
              <p className="mt-4 text-lg text-brand-muted-foreground max-w-2xl mx-auto">
                The passionate minds behind tiply
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 gap-8 justify-items-center">
              {teamMembers.map((member, index) => (
                <motion.div 
                  key={index}
                  className="bg-brand-surface p-6 rounded-xl ring-1 ring-brand-border max-w-md"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-full h-24 rounded-full bg-brand-primary/20 overflow-hidden">
                      <img 
                        src={member?.imageSrc}
                        alt={member?.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-semibold text-brand-foreground">
                        {member?.name}
                      </h3>
                      <p className="text-brand-primary font-medium">{member?.role}</p>
                      <p className="mt-2 text-brand-muted-foreground">
                        {member?.bio}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Powered By Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-semibold text-brand-foreground mb-8">
                Built on the fastest blockchain
              </h2>
              <div className="flex justify-center">
                <a 
                  href="https://solana.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <PoweredBySolanaIllustration />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div 
              className="rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-accent/20 p-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-brand-foreground mb-4">
                Join Us on This Journey 🌈
              </h2>
              <p className="text-lg text-brand-muted-foreground max-w-2xl mx-auto mb-8">
                Whether you're a creator looking to get supported or a fan wanting to show appreciation,
                we're building tiply for you. This is just the beginning.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/signup" className="inline-flex items-center justify-center rounded-md bg-brand-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-primary/90 transition-colors">
                  Get Started
                </a>
                <a href="/contact" className="inline-flex items-center justify-center rounded-md border border-brand-border bg-brand-surface px-6 py-3 text-base font-medium text-brand-foreground hover:bg-brand-surface/80 transition-colors">
                  Get in Touch
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default AboutUsPage