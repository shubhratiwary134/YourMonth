export default function usePokemon() {
  const fetchRandomPokemon = async () => {
    // Pick a random ID between 1-151 (Gen 1 only)
    const id = Math.floor(Math.random() * 151) + 1
    
    // Fetch from PokéAPI
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    
    if (!res.ok) {
      throw new Error('Failed to fetch from PokéAPI')
    }
    
    const data = await res.json()
    
    // Extract only what we need
    return {
      id: data.id,
      name: data.name,
      type: data.types[0].type.name,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`
    }
  }

  return { fetchRandomPokemon }
}
