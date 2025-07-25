import json
import random
import math
import csv

import os
#độ khó của game:
# + kích thước grid
# + số lượng subtile
# + số lượng negative tile và số lượng positive tile
# tăng độ khó theo cycle 
# balance game = level+difficulty
class LevelGenerator:
    def __init__(self, level: int):
        self.level = level
        self.difficulty = self._calculate_difficulty(level)
        self._grid_height, self._grid_width = self._generate_grid_size()
        self.theme = self._generate_theme()
        self.tile_data = self._generate_tiles_and_specials()
    
    def _calculate_difficulty(self, level: int):
        cycle = 20
        pos_in_cycle = level % cycle
        if pos_in_cycle <= cycle // 2:
            return pos_in_cycle / 2.0
        else:
            return (cycle - pos_in_cycle) / 2.0
    
    def _generate_grid_size(self):
        base_height = 4 + int(self.difficulty * 0.8)
        base_width = 3 + int(self.difficulty * 0.8)
        height = min(base_height + random.randint(0, 1), 7)
        width = min(base_width + random.randint(0, 1), 10)
        
        while True:
            total_tiles = height * width
            if total_tiles % 2 == 0:
                return height, width
            if width < 10:
                width += 1
            elif height < 7:
                height += 1
            else:
                if random.choice([True, False]):
                    width -= 1
                else:
                    height -= 1
    
    def _generate_theme(self):
        return random.choice(['FOOD', 'BUTTERFLY', 'DRINK'])
    
    def _generate_tiles_and_specials(self):
        total_tiles = self._grid_height * self._grid_width
        
        max_specials = min(total_tiles // 4, 6)
        num_rocket_tiles = max(0, round(max_specials * (0.3 + 0.1 * self.difficulty)))
        
        if num_rocket_tiles % 2 != 0:
            num_rocket_tiles = max(0, num_rocket_tiles - 1)
        
        bomb_ratio = 0.15 + 0.08 * self.difficulty
        bomb_ratio = min(bomb_ratio, 0.6)
        max_bombs = min((total_tiles - num_rocket_tiles) // 4, 8)
        num_bomb_effects = round(max_bombs * bomb_ratio)
        
        if self.level < 4:
            num_bomb_effects = 0
        
        remaining_tiles = total_tiles - num_rocket_tiles 
        
        num_tile_types = self._calculate_num_tile_types()
        
        selected_tile_types = list(range(num_tile_types))
        
        tile_distribution = self._distribute_normal_tiles(remaining_tiles, selected_tile_types)
        
        rockets =  num_rocket_tiles
        bomb_effects =  num_bomb_effects
        
        return {
            'TotalTiles': total_tiles,
            'RocketTiles': rockets,
            'BombEffects': bomb_effects,
            'TileDistribution': tile_distribution
        }
    
    def _calculate_num_tile_types(self):
        
        if self.difficulty <= 1:
            base_types = 4
        elif self.difficulty <= 2:
            base_types = 5
        elif self.difficulty <= 3:
            base_types = 5
        elif self.difficulty <= 4:
            base_types = 6
        else:
            base_types = 7
        
        variation = 0
        if self.level % 10 >= 7:  
            variation = 1
        elif self.level % 10 <= 2:
            variation = -1
        
        num_types = max(3, min(7, base_types + variation))
        
        return num_types
    def _distribute_normal_tiles(self, total_normal_tiles, tile_types):
        
        num_types = len(tile_types)
        
        min_pairs_per_type = 1
        base_tiles = min_pairs_per_type * 2 * num_types
        
        if total_normal_tiles < base_tiles:
            pairs_per_type = max(1, total_normal_tiles // (2 * num_types))
            remaining = total_normal_tiles - (pairs_per_type * 2 * num_types)
            
            distribution = {}
            for i, tile_type in enumerate(tile_types):
                count = pairs_per_type * 2
                if i < remaining // 2:  
                    count += 2
                distribution[tile_type] = count
            
            return distribution
        
        distribution = {tile_type: min_pairs_per_type * 2 for tile_type in tile_types}
        
        remaining_tiles = total_normal_tiles - base_tiles
        extra_pairs = remaining_tiles // 2
        
        pairs_per_type = extra_pairs // num_types
        leftover_pairs = extra_pairs % num_types
        
        for tile_type in tile_types:
            distribution[tile_type] += pairs_per_type * 2
        
        for i in range(leftover_pairs):
            selected_type = random.choice(tile_types)
            distribution[selected_type] += 2
        
        return distribution
    
    def _calculate_tile_weights(self, tile_types):
        weights = []
        
        for i, tile_type in enumerate(tile_types):
            # Base weight
            weight = 1.0
            
            if self.difficulty < 2:
                if tile_type < 4:
                    weight *= 1.5
                else:
                    weight *= 0.7
            elif self.difficulty < 4:
                if tile_type < 6:
                    weight *= 1.2
                else:
                    weight *= 0.9
            else:
                weight *= 1.0
            
            level_factor = 1 + (self.level % 10) * 0.05
            if tile_type == (self.level % len(tile_types)):
                weight *= level_factor
            
            weights.append(weight)
        
        return weights
    
    def export_level_data(self):
        return {
            'Level': self.level,
            'Difficulty': self.difficulty,
            'GridHeight': self._grid_height,
            'GridWidth': self._grid_width,
            'Theme': self.theme,
            'Tiles': {
                'TotalTiles': self.tile_data['TotalTiles'],
                'RocketTiles': self.tile_data['RocketTiles'],
                'BombEffects': self.tile_data['BombEffects'],
                'NormalTiles': self.tile_data['TileDistribution']
            },
        }
    
    def save_to_file(self, path: str):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.export_level_data(), f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
   
    
    levels = []
    for i in range(1, 101):
        generator = LevelGenerator(i)
        generator.save_to_file(f"map/level_{i}.json")
        data = generator.export_level_data()
        tiles = data['Tiles']
        normal_sum = sum(tiles['NormalTiles'].values()) if isinstance(tiles['NormalTiles'], dict) else 0
        levels.append({
            'Level': data['Level'],
            'GridHeight': data['GridHeight'],
            'GridWidth': data['GridWidth'],
            'TotalTiles': tiles['TotalTiles'],
            'RocketTiles': tiles['RocketTiles'],
            'BombEffects': tiles['BombEffects'],
            'NormalTilesSum': normal_sum,
            'Difficulty': generator.difficulty
        })

    with open('levels_summary.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Level', 'GridHeight', 'GridWidth', 'TotalTiles', 'RocketTiles', 'BombEffects', 'NormalTilesSum','Difficulty']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in levels:
            writer.writerow(row)

    print("Generated 100 levels and levels_summary.csv successfully!")