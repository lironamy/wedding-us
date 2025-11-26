// Export all templates
export { default as ClassicTemplate } from './ClassicTemplate';
export { default as RomanticGardenTemplate } from './RomanticGardenTemplate';
export { default as LuxuryMinimalTemplate } from './LuxuryMinimalTemplate';
export { default as ArtDecoTemplate } from './ArtDecoTemplate';
export { default as StarryNightTemplate } from './StarryNightTemplate';
export { default as MediterraneanTemplate } from './MediterraneanTemplate';
export { default as EnchantedForestTemplate } from './EnchantedForestTemplate';
export { default as MarbleGoldTemplate } from './MarbleGoldTemplate';
export { default as VintageLettersTemplate } from './VintageLettersTemplate';
export { default as CarnivalTemplate } from './CarnivalTemplate';
export { default as BeachShellsTemplate } from './BeachShellsTemplate';
export { default as JapaneseZenTemplate } from './JapaneseZenTemplate';
export { default as JazzClubTemplate } from './JazzClubTemplate';
export { default as RenaissanceTemplate } from './RenaissanceTemplate';
export { default as ScandinavianTemplate } from './ScandinavianTemplate';
export { default as CyberPastelTemplate } from './CyberPastelTemplate';
export { default as CosmicGalaxyTemplate } from './CosmicGalaxyTemplate';
export { default as TropicalParadiseTemplate } from './TropicalParadiseTemplate';
export { default as FairytaleTemplate } from './FairytaleTemplate';
export { default as IndustrialChicTemplate } from './IndustrialChicTemplate';
export { default as WatercolorTemplate } from './WatercolorTemplate';
export { default as MoroccanTemplate } from './MoroccanTemplate';
export { default as WinterWonderlandTemplate } from './WinterWonderlandTemplate';
export { default as BotanicalTemplate } from './BotanicalTemplate';
export { default as NeonFuturisticTemplate } from './NeonFuturisticTemplate';
export { default as PaperCutTemplate } from './PaperCutTemplate';

// Export types
export * from './types';

// Template component map
import ClassicTemplate from './ClassicTemplate';
import RomanticGardenTemplate from './RomanticGardenTemplate';
import LuxuryMinimalTemplate from './LuxuryMinimalTemplate';
import ArtDecoTemplate from './ArtDecoTemplate';
import StarryNightTemplate from './StarryNightTemplate';
import MediterraneanTemplate from './MediterraneanTemplate';
import EnchantedForestTemplate from './EnchantedForestTemplate';
import MarbleGoldTemplate from './MarbleGoldTemplate';
import VintageLettersTemplate from './VintageLettersTemplate';
import CarnivalTemplate from './CarnivalTemplate';
import BeachShellsTemplate from './BeachShellsTemplate';
import JapaneseZenTemplate from './JapaneseZenTemplate';
import JazzClubTemplate from './JazzClubTemplate';
import RenaissanceTemplate from './RenaissanceTemplate';
import ScandinavianTemplate from './ScandinavianTemplate';
import CyberPastelTemplate from './CyberPastelTemplate';
import CosmicGalaxyTemplate from './CosmicGalaxyTemplate';
import TropicalParadiseTemplate from './TropicalParadiseTemplate';
import FairytaleTemplate from './FairytaleTemplate';
import IndustrialChicTemplate from './IndustrialChicTemplate';
import WatercolorTemplate from './WatercolorTemplate';
import MoroccanTemplate from './MoroccanTemplate';
import WinterWonderlandTemplate from './WinterWonderlandTemplate';
import BotanicalTemplate from './BotanicalTemplate';
import NeonFuturisticTemplate from './NeonFuturisticTemplate';
import PaperCutTemplate from './PaperCutTemplate';
import type { InvitationTemplateProps } from './types';

export const TemplateComponents: Record<string, React.ComponentType<InvitationTemplateProps>> = {
  'classic': ClassicTemplate,
  'romantic-garden': RomanticGardenTemplate,
  'luxury-minimal': LuxuryMinimalTemplate,
  'art-deco': ArtDecoTemplate,
  'starry-night': StarryNightTemplate,
  'mediterranean': MediterraneanTemplate,
  'enchanted-forest': EnchantedForestTemplate,
  'marble-gold': MarbleGoldTemplate,
  'vintage-letters': VintageLettersTemplate,
  'carnival': CarnivalTemplate,
  'beach-shells': BeachShellsTemplate,
  'japanese-zen': JapaneseZenTemplate,
  'jazz-club': JazzClubTemplate,
  'renaissance': RenaissanceTemplate,
  'scandinavian': ScandinavianTemplate,
  'cyber-pastel': CyberPastelTemplate,
  'cosmic-galaxy': CosmicGalaxyTemplate,
  'tropical-paradise': TropicalParadiseTemplate,
  'fairytale': FairytaleTemplate,
  'industrial-chic': IndustrialChicTemplate,
  'watercolor': WatercolorTemplate,
  'moroccan': MoroccanTemplate,
  'winter-wonderland': WinterWonderlandTemplate,
  'botanical': BotanicalTemplate,
  'neon-futuristic': NeonFuturisticTemplate,
  'paper-cut': PaperCutTemplate,
};

// Get template component by ID
export function getTemplateComponent(templateId: string): React.ComponentType<InvitationTemplateProps> {
  return TemplateComponents[templateId] || ClassicTemplate;
}
