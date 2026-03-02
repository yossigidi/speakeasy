import React from 'react';
import AdventureGame from '../components/adventure/AdventureGame.jsx';

export default function AdventurePage({ onBack }) {
  return <AdventureGame onBack={onBack} />;
}
