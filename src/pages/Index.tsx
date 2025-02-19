
import ConsistencyTracker from '@/components/ConsistencyTracker';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';

const Index = () => {
  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Mail, href: 'mailto:your@email.com', label: 'Email' },
  ];

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <section className="mb-12 fade-enter">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hi, I'm <span className="text-primary">Your Name</span>
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            A passionate developer dedicated to learning and building in public.
          </p>
          <div className="flex gap-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                aria-label={label}
              >
                <Icon className="w-6 h-6 text-gray-600 hover:text-gray-900" />
              </a>
            ))}
          </div>
        </section>

        <section className="mb-12 slide-enter">
          <h2 className="text-2xl font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {['JavaScript', 'React', 'Node.js', 'TypeScript', 'Tailwind CSS'].map(
              (skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors duration-200"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </section>

        <section className="mb-12">
          <ConsistencyTracker />
        </section>
      </div>
    </div>
  );
};

export default Index;
