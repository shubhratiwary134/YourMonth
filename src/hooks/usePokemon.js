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
      id:       data.id,
      name:     data.name,
      type:     data.types[0].type.name,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,

      types: data.types.map(t => t.type.name),
      stats: {
        hp:             data.stats[0].base_stat,
        attack:         data.stats[1].base_stat,
        defense:        data.stats[2].base_stat,
        specialAttack:  data.stats[3].base_stat,
        specialDefense: data.stats[4].base_stat,
        speed:          data.stats[5].base_stat
      },
      moves: data.moves
        .slice(0, 4)
        .map(m => m.move.name
          .split("-")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
        ),
      abilities: data.abilities
        .map(a => a.ability.name
          .split("-")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
        ).join(", "),
      height: (data.height / 10).toFixed(1) + "m",
      weight: (data.weight / 10).toFixed(1) + "kg",
    }
  }

  return { fetchRandomPokemon }
}

export const fetchPokemonStats = async (pokemonId) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
  const data = await res.json()

  return {
    name: data.name,
    id: data.id,
    type: data.types.map(t => t.type.name).join(", "),
    stats: {
      hp:             data.stats[0].base_stat,
      attack:         data.stats[1].base_stat,
      defense:        data.stats[2].base_stat,
      specialAttack:  data.stats[3].base_stat,
      specialDefense: data.stats[4].base_stat,
      speed:          data.stats[5].base_stat
    },
    abilities: data.abilities.map(a => a.ability.name).join(", "),
    height: data.height,
    weight: data.weight
  }
}
