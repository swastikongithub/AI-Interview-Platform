import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { SectionHeader } from '../../components/common/SectionHeader';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Badge } from '../../components/common/Badge';
import { ScoreCard, ScoreChip } from '../../components/common/Score';
import { LightCard } from '../../components/common/LightCard';
import { SpotlightCard } from '../../components/common/SpotlightCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Tooltip } from '../../components/common/Tooltip';
import { useToast } from '../../components/common/Toast';
import { Inbox, Zap, CheckCircle } from 'lucide-react';

export const ComponentPlayground: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="p-section-sm max-w-7xl mx-auto min-h-screen bg-background space-y-16">
      <div>
        <h1 className="font-display text-4xl font-semibold mb-2 text-text-primary">
          Component Playground
        </h1>
        <p className="text-text-muted mb-12">
          This route is only available in development mode for building and testing components in isolation.
        </p>
      </div>

      <section>
        <SectionHeader eyebrow="Typography" title="Section Header" description="Used for major page or section titles." />
      </section>

      <section className="space-y-6">
        <SectionHeader title="Buttons" />
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="accent">Accent Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button disabled>Disabled</Button>
          <Button isLoading>Loading</Button>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="Badges" />
        <div className="flex flex-wrap gap-4 items-center">
          <Badge>Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <section className="space-y-6 max-w-md">
        <SectionHeader title="Forms" />
        <Input label="Email Address" placeholder="alex@example.com" />
        <Input label="Password" type="password" error="Password must be at least 8 characters" />
        <Textarea label="Cover Letter" placeholder="Tell us about yourself..." />
      </section>

      <section className="space-y-6">
        <SectionHeader title="Feedback & Overlays" />
        <div className="flex flex-wrap gap-4 items-center">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Button 
            variant="secondary" 
            onClick={() => toast({ type: 'success', title: 'Action successful', message: 'Your changes have been saved.' })}
          >
            Show Toast
          </Button>
          <Tooltip content="This is a helpful tooltip message!">
            <Button variant="ghost">Hover me</Button>
          </Tooltip>
        </div>
      </section>

      <section className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <SectionHeader title="Light Card" />
          <LightCard>
            <h3 className="text-xl font-semibold mb-2">Standard Content</h3>
            <p className="text-text-muted mb-4">Used for typical dashboard widgets and forms.</p>
            <Button variant="secondary" size="sm">Action</Button>
          </LightCard>
        </div>
        <div className="space-y-6">
          <SectionHeader title="Spotlight Card" />
          <SpotlightCard icon={Zap}>
            <h3 className="text-xl font-semibold mb-2 text-text-inverted">Premium Feature</h3>
            <p className="text-text-inverted-muted mb-6">High contrast area for important calls to action.</p>
            <Button variant="accent" size="sm">Get Started</Button>
          </SpotlightCard>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="Score Indicators" />
        <div className="flex flex-wrap gap-8 items-center">
          <ScoreCard score={92} />
          <ScoreCard score={65} />
          <ScoreCard score={30} />
          <div className="flex flex-col gap-4 border border-border-light p-6 rounded-card-md">
            <p className="text-sm text-text-muted mb-2">Score chips (compact):</p>
            <ScoreChip score={85} />
            <ScoreChip score={45} />
          </div>
        </div>
      </section>

      <section className="space-y-6 max-w-2xl">
        <SectionHeader title="States" />
        <div className="space-y-4 mb-8">
          <p className="text-sm font-medium">Skeleton Loader</p>
          <SkeletonLoader className="h-32 w-full" />
          <div className="flex gap-4">
            <SkeletonLoader className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <SkeletonLoader className="h-4 w-3/4" />
              <SkeletonLoader className="h-4 w-1/2" />
            </div>
          </div>
        </div>
        
        <div className="border border-border-light rounded-card-md bg-surface-light">
          <EmptyState 
            icon={Inbox} 
            title="No messages yet" 
            description="When you receive new messages, they will appear here." 
            action={<Button variant="secondary">Refresh</Button>}
          />
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Action"
        description="Are you sure you want to proceed with this action? This cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
          </>
        }
      >
        <div className="py-4">
          <p className="text-text-primary mb-4">
            Modal content goes here. You can put forms, confirmation details, or anything else inside.
          </p>
        </div>
      </Modal>
    </div>
  );
};
