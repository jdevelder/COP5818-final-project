// TCG Card Database with images and metadata

export interface CardData {
  id: string;
  name: string;
  set: string;
  rarity: 1 | 2 | 3 | 4 | 5;
  game: 'Pokemon' | 'MTG' | 'YuGiOh' | 'Other';
  imageUrl: string;
  description: string;
  averagePrice: number;
  priceHistory: number[];
  marketCap?: number;
  volume24h?: number;
  holders?: number;
}

export const CARD_DATABASE: Record<string, CardData> = {
  'Charizard-BaseSet-Rare': {
    id: 'Charizard-BaseSet-Rare',
    name: 'Charizard',
    set: 'Base Set',
    rarity: 5,
    game: 'Pokemon',
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    description: 'The iconic fire-breathing dragon Pokemon. One of the most sought-after cards in Pokemon TCG history.',
    averagePrice: 10,
    priceHistory: [8, 9, 10, 11, 10],
    marketCap: 5000000,
    volume24h: 50000,
    holders: 1234,
  },
  'BlackLotus-Alpha-Mythic': {
    id: 'BlackLotus-Alpha-Mythic',
    name: 'Black Lotus',
    set: 'Alpha',
    rarity: 5,
    game: 'MTG',
    imageUrl: 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    description: 'The most valuable Magic: The Gathering card ever printed. Provides three mana of any color.',
    averagePrice: 100000,
    priceHistory: [95000, 98000, 100000, 102000, 100000],
    marketCap: 50000000,
    volume24h: 500000,
    holders: 89,
  },
  'PikachuEX-XY-Rare': {
    id: 'PikachuEX-XY-Rare',
    name: 'Pikachu',
    set: 'Base Set',
    rarity: 4,
    game: 'Pokemon',
    imageUrl: 'https://i5.walmartimages.com/seo/Pokemon-Base-Set-Common-Pikachu-58-Shadowless_80e7c372-6162-42ac-a0c6-b83b9612dc75.d9c3915429016e365b1ea40cb11a501d.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF',
    description: 'Electric-type Pokemon with powerful attacks. Popular among collectors and players.',
    averagePrice: 5,
    priceHistory: [4, 4.5, 5, 5.2, 5],
    marketCap: 250000,
    volume24h: 15000,
    holders: 567,
  },
  'BlueEyesWhiteDragon-LOB-Ultra': {
    id: 'BlueEyesWhiteDragon-LOB-Ultra',
    name: 'Blue-Eyes White Dragon',
    set: 'Legend of Blue Eyes',
    rarity: 5,
    game: 'YuGiOh',
    imageUrl: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
    description: 'Kaiba\'s signature monster. A powerful dragon with 3000 ATK.',
    averagePrice: 50,
    priceHistory: [45, 48, 50, 52, 50],
    marketCap: 1000000,
    volume24h: 25000,
    holders: 345,
  },
  'TimeWalk-Alpha-Rare': {
    id: 'TimeWalk-Alpha-Rare',
    name: 'Time Walk',
    set: 'Alpha',
    rarity: 5,
    game: 'MTG',
    imageUrl: 'https://cards.scryfall.io/large/front/7/0/70901356-3266-4bd9-aacc-f06c27271de5.jpg',
    description: 'One of the Power Nine. Take an extra turn after this one.',
    averagePrice: 15000,
    priceHistory: [14000, 14500, 15000, 15500, 15000],
    marketCap: 5000000,
    volume24h: 100000,
    holders: 234,
  },
  'MewTwo-BaseSet-Rare': {
    id: 'MewTwo-BaseSet-Rare',
    name: 'MewTwo',
    set: 'Base Set',
    rarity: 4,
    game: 'Pokemon',
    imageUrl: 'https://images.pokemontcg.io/base1/10_hires.png',
    description: 'Legendary Psychic-type Pokemon created through genetic manipulation.',
    averagePrice: 8,
    priceHistory: [7, 7.5, 8, 8.5, 8],
    marketCap: 400000,
    volume24h: 20000,
    holders: 789,
  },
  'Blastoise-BaseSet-Rare': {
    id: 'Blastoise-BaseSet-Rare',
    name: 'Blastoise',
    set: 'Base Set',
    rarity: 5,
    game: 'Pokemon',
    imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
    description: 'The powerful Water-type starter evolution. Known for its Hydro Pump attack.',
    averagePrice: 9,
    priceHistory: [7.5, 8, 8.5, 9, 9.2],
    marketCap: 450000,
    volume24h: 30000,
    holders: 890,
  },
  'Venusaur-BaseSet-Rare': {
    id: 'Venusaur-BaseSet-Rare',
    name: 'Venusaur',
    set: 'Base Set',
    rarity: 5,
    game: 'Pokemon',
    imageUrl: 'https://images.pokemontcg.io/base1/15_hires.png',
    description: 'The fully evolved Grass-type starter. Features a massive flower on its back.',
    averagePrice: 7,
    priceHistory: [6, 6.5, 7, 7.2, 7],
    marketCap: 380000,
    volume24h: 25000,
    holders: 756,
  },
};

export const RARITY_COLORS = {
  1: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Common' },
  2: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Uncommon' },
  3: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Rare' },
  4: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Epic' },
  5: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Mythic' },
};

export const GAME_COLORS = {
  Pokemon: { primary: '#EE1515', secondary: '#3B4CCA' },
  MTG: { primary: '#000000', secondary: '#FFA500' },
  YuGiOh: { primary: '#1E40AF', secondary: '#DC2626' },
  Other: { primary: '#6B7280', secondary: '#9CA3AF' },
};

export function getCardData(cardId: string): CardData | undefined {
  return CARD_DATABASE[cardId];
}

export function getAllCards(): CardData[] {
  return Object.values(CARD_DATABASE);
}

export function getCardsByGame(game: string): CardData[] {
  return getAllCards().filter(card => card.game === game);
}

export function getCardsByRarity(rarity: number): CardData[] {
  return getAllCards().filter(card => card.rarity === rarity);
}

export function searchCards(query: string): CardData[] {
  const lowerQuery = query.toLowerCase();
  return getAllCards().filter(
    card =>
      card.name.toLowerCase().includes(lowerQuery) ||
      card.set.toLowerCase().includes(lowerQuery) ||
      card.description.toLowerCase().includes(lowerQuery)
  );
}
