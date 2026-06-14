export const CITIES_BY_REGION = {
  "France": [
    "Aix-en-Provence", "Agde", "Ajaccio", "Arras", "Aubenas", "Auxerre", "Avignon", "Bastia", "Béziers", 
    "Biarritz", "Bondy", "Bordeaux", "Brest", "Castres", "Charleville-Mézières", "Chessy", "Clermont-Ferrand", 
    "Colmar", "Dax", "Douai", "Dunkerque", "Épernay", "Gap", "Grenoble", "La Rochelle", "Le Puy-en-Velay", 
    "Le Touquet", "Lille", "Limoges", "Lyon", "Mâcon", "Marseille", "Metz", "Montélimar", "Montpellier", 
    "Mulhouse", "Nantes", "Nevers", "Nice", "Nîmes", "Orly", "Paris", "Perpignan", "Poitiers", "Privas", 
    "Reims", "Rennes", "Roanne", "Saint-Étienne", "Saint-Quentin", "Strasbourg", "Toulon", "Toulouse", 
    "Tournon-sur-Rhône", "Tulle", "Valence", "Valenciennes", "Verdun", "Vichy"
  ],
  "Belgique": [
    "Anvers", "Ath", "Bruges", "Bruxelles", "Charleroi", "Courtrai", "Mons", "Mouscron", "Tournai"
  ],
  "Suisse": [
    "Berne", "Genève", "Lausanne"
  ],
  "Outre-mer": [
    "Guadeloupe", "Guyane Française", "Île Maurice", "Martinique", "Nouvelle-Calédonie", "Réunion", 
    "Saint-Barthélemy", "Saint-Pierre-et-Miquelon"
  ]
};

export const AVAILABLE_CITIES = Object.values(CITIES_BY_REGION).flat().sort();
