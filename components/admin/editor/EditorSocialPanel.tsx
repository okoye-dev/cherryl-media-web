import { AIChip, Label, Panel, Tabs, TextInput } from "@/components/admin/ui";
import { LIMITS } from "./limits";

export type Channel = "x" | "facebook" | "linkedin" | "newsletter";

const CHANNELS: Record<Channel, { tab: string; label: string; id: string; max: number; placeholder: string }> = {
  x: { tab: "X", label: "X post", id: "social-x", max: LIMITS.x, placeholder: "Key facts and the link" },
  facebook: { tab: "Facebook", label: "Facebook post", id: "social-fb", max: LIMITS.facebook, placeholder: "Context and headline" },
  linkedin: { tab: "LinkedIn", label: "LinkedIn post", id: "social-li", max: LIMITS.linkedin, placeholder: "The business or policy angle" },
  newsletter: { tab: "Newsletter", label: "Newsletter summary", id: "social-nl", max: LIMITS.newsletter, placeholder: "A short summary for subscribers" },
};

interface Props {
  channel: Channel;
  onChannelChange: (channel: Channel) => void;
  values: Record<Channel, string>;
  onChange: (channel: Channel, value: string) => void;
  isAi: (channel: Channel) => boolean;
}

export default function EditorSocialPanel({ channel, onChannelChange, values, onChange, isAi }: Props) {
  const c = CHANNELS[channel];
  return (
    <Panel title="Social posts" description="Write a version of this story for each channel.">
      <div className="space-y-4">
        <Tabs
          value={channel}
          onChange={onChannelChange}
          items={(Object.keys(CHANNELS) as Channel[]).map((id) => ({ id, label: CHANNELS[id].tab }))}
        />
        <div>
          <Label htmlFor={c.id}>
            {c.label} {isAi(channel) && <AIChip className="ml-1" />}
          </Label>
          <TextInput
            id={c.id}
            multiline
            alwaysCount
            value={values[channel]}
            maxLength={c.max}
            onChange={(e) => onChange(channel, e.target.value)}
            placeholder={c.placeholder}
            className="min-h-24 leading-relaxed"
          />
        </div>
      </div>
    </Panel>
  );
}
