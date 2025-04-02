#!/usr/bin/env ruby
require 'json'
require 'fileutils'

# Directory containing the sprite files
SPRITE_DIR = File.join(File.dirname(__FILE__), 'Sprite')
# Output JSON file
OUTPUT_FILE = File.join(File.dirname(__FILE__), 'skin_tags.json')

# Initialize results hash
skin_tags = {}

# Define classes and rarities for validation
CLASSES = ['Bomber', 'Champion', 'Orc']
RARITIES = ['common', 'uncommon', 'uncommom', 'rare', 'epic', 'legendary'] # Note: include misspelled 'uncommom'
SLOTS = ['head', 'body', 'arms', 'legs', 'belt']
COLORS = ['grey', 'red', 'blue', 'green', 'violet', 'purple', 'yellow', 'orange', 'pink', 'brown', 'black', 'turquoise', 'gold', 'gray']

# Define human-friendly names for skin sets
SKIN_SET_FRIENDLY_NAMES = {
  'tank' => 'Battering Ram',
  'cyber' => 'Cyber Gladiator',
  'soldier' => 'Steel Quarterback',
  'doomsday' => 'Street Falcon',
  'ronin' => 'Ronin'
}

# Define all the required fields all entries should have
REQUIRED_FIELDS = ['class', 'gender', 'skin_set', 'skin_set_name', 'slot', 'color', 'rarity']

# Process each file in the Sprite directory
Dir.glob(File.join(SPRITE_DIR, '*.png')).each do |file|
  filename = File.basename(file)
  tags = {}
  
  # Skip files that don't match our expected Hero pattern or special files
  next unless filename.start_with?('Hero') && filename.include?('_')
  
  # Extract basic information using simple pattern: HeroClassGender_...
  if filename =~ /^Hero(\w+)(Male|Female)/
    character_class = $1
    gender = $2
    
    # Standardize class extraction
    if CLASSES.any? { |c| character_class.downcase.include?(c.downcase) }
      tags['class'] = character_class
    end
    
    # Gender is straightforward
    tags['gender'] = gender
    
    # Extract remaining parts from the filename
    parts = filename.split('_')
    
    # Remove the .png extension from the last part
    parts[-1] = parts[-1].gsub('.png', '') if parts[-1].include?('.png')
    
    # Handle special cases with numeric skin sets (e.g., 403)
    if parts.any? { |p| p =~ /^\d+$/ }
      skin_set_index = parts.find_index { |p| p =~ /^\d+$/ }
      if skin_set_index
        tags['skin_set'] = parts[skin_set_index]
      end
    end
    
    # Look for skin set names (typical position after prefix)
    potential_skin_sets = ['armor', 'ronin', 'doomsday', 'soldier', 'cyber', 'gladiator', 
                          'tank', 'sabbath', 'horned', 'tusked', 'start']
    
    # Check for rarity in the last part (common pattern)
    if RARITIES.include?(parts[-1].downcase)
      tags['rarity'] = parts[-1].downcase
      # Normalize 'uncommom' to 'uncommon'
      tags['rarity'] = 'uncommon' if tags['rarity'] == 'uncommom'
    end
    
    # Process each part of the filename
    parts.each do |part|
      part_downcase = part.downcase
      
      # Check for skin sets
      if potential_skin_sets.include?(part_downcase)
        tags['skin_set'] = part_downcase unless tags.key?('skin_set')
      end
      
      # Check for slots
      if SLOTS.include?(part_downcase)
        tags['slot'] = part_downcase
      end
      
      # Check for colors
      if COLORS.include?(part_downcase)
        tags['color'] = part_downcase
      end
      
      # Additional check for rarities anywhere in the string
      if RARITIES.include?(part_downcase) && !tags.key?('rarity')
        tags['rarity'] = part_downcase
        # Normalize 'uncommom' to 'uncommon'
        tags['rarity'] = 'uncommon' if tags['rarity'] == 'uncommom'
      end
    end

    # Special handling for the examples provided by the user
    if filename == "HeroBomberFemale_armor_403_bomber_female_head_grey_common.png" && !tags.key?('rarity')
      tags['rarity'] = 'common'
    elsif filename == "HeroChampionFemale_legs_doomsday_pink_uncommon.png" && !tags.key?('rarity')
      tags['rarity'] = 'uncommon'
    end
    
    # For files with 'uncommom' in the name but no rarity tag yet
    if filename.downcase.include?('uncommom') && !tags.key?('rarity')
      tags['rarity'] = 'uncommon'
    end
  end
  
  # Only add files that have at least some tags
  if tags.any?
    skin_tags[filename] = tags
  else
    puts "Warning: Could not parse tags for #{filename}"
  end
end

# Final pass to ensure all 'uncommom' values are mapped to 'uncommon' and add human-friendly names
skin_tags.each do |filename, tags|
  if tags['rarity'] == 'uncommom'
    tags['rarity'] = 'uncommon'
  end
  
  # Add human-friendly skin set name if available
  if tags.key?('skin_set')
    if SKIN_SET_FRIENDLY_NAMES.key?(tags['skin_set'])
      tags['skin_set_name'] = SKIN_SET_FRIENDLY_NAMES[tags['skin_set']]
    else
      # Capitalize the skin_set value for a default friendly name
      tags['skin_set_name'] = tags['skin_set'].capitalize
    end
  end
  
  # Ensure all required fields exist (use empty string for missing values)
  REQUIRED_FIELDS.each do |field|
    tags[field] = "" unless tags.key?(field)
  end
end

# Write the results to the JSON file
File.open(OUTPUT_FILE, 'w') do |f|
  f.write(JSON.pretty_generate(skin_tags))
end

puts "Processed #{skin_tags.size} files"
puts "Results written to #{OUTPUT_FILE}" 