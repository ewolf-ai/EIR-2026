// Script to import offered positions data into Supabase
// Run this script once to populate the database with EIR 2026 positions

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importData() {
  console.log('Starting data import...');

  try {
    // Read data from JSON file
    const dataPath = path.join(__dirname, 'eir-positions.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const positions = JSON.parse(rawData);

    console.log(`Found ${positions.length} positions to import`);

    // Import in batches of 100
    const batchSize = 100;
    for (let i = 0; i < positions.length; i += batchSize) {
      const batch = positions.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('offered_positions')
        .insert(batch);

      if (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`Imported batch ${i / batchSize + 1} (${batch.length} positions)`);
      }
    }

    console.log('Data import completed!');

    // Import autonomous communities mapping
    await importAutonomousCommunities();

  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

async function importAutonomousCommunities() {
  console.log('Importing autonomous communities mapping...');

  const communityMapping = [
    { province: 'A CORUÑA', community: 'Galicia' },
    { province: 'ALBACETE', community: 'Castilla-La Mancha' },
    { province: 'ALICANTE/ALACANT', community: 'Comunidad Valenciana' },
    { province: 'ALMERÍA', community: 'Andalucía' },
    { province: 'ASTURIAS', community: 'Principado de Asturias' },
    { province: 'BADAJOZ', community: 'Extremadura' },
    { province: 'BARCELONA', community: 'Cataluña' },
    { province: 'BIZKAIA', community: 'País Vasco' },
    { province: 'BURGOS', community: 'Castilla y León' },
    { province: 'CANTABRIA', community: 'Cantabria' },
    { province: 'CASTELLÓN/CASTELLÓ', community: 'Comunidad Valenciana' },
    { province: 'CEUTA', community: 'Ceuta' },
    { province: 'CIUDAD REAL', community: 'Castilla-La Mancha' },
    { province: 'CUENCA', community: 'Castilla-La Mancha' },
    { province: 'CÁCERES', community: 'Extremadura' },
    { province: 'CÁDIZ', community: 'Andalucía' },
    { province: 'CÓRDOBA', community: 'Andalucía' },
    { province: 'GIPUZKOA', community: 'País Vasco' },
    { province: 'GIRONA', community: 'Cataluña' },
    { province: 'GRANADA', community: 'Andalucía' },
    { province: 'GUADALAJARA', community: 'Castilla-La Mancha' },
    { province: 'HUELVA', community: 'Andalucía' },
    { province: 'HUESCA', community: 'Aragón' },
    { province: 'ISLAS BALEARES/ILLES BALEARS', community: 'Islas Baleares' },
    { province: 'JAÉN', community: 'Andalucía' },
    { province: 'LA RIOJA', community: 'La Rioja' },
    { province: 'LAS PALMAS', community: 'Canarias' },
    { province: 'LEÓN', community: 'Castilla y León' },
    { province: 'LLEIDA', community: 'Cataluña' },
    { province: 'LUGO', community: 'Galicia' },
    { province: 'MADRID', community: 'Comunidad de Madrid' },
    { province: 'MELILLA', community: 'Melilla' },
    { province: 'MURCIA', community: 'Región de Murcia' },
    { province: 'MÁLAGA', community: 'Andalucía' },
    { province: 'NAVARRA', community: 'Comunidad Foral de Navarra' },
    { province: 'OURENSE', community: 'Galicia' },
    { province: 'PALENCIA', community: 'Castilla y León' },
    { province: 'PONTEVEDRA', community: 'Galicia' },
    { province: 'SALAMANCA', community: 'Castilla y León' },
    { province: 'SANTA CRUZ DE TENERIFE', community: 'Canarias' },
    { province: 'SEGOVIA', community: 'Castilla y León' },
    { province: 'SEVILLA', community: 'Andalucía' },
    { province: 'SORIA', community: 'Castilla y León' },
    { province: 'TARRAGONA', community: 'Cataluña' },
    { province: 'TERUEL', community: 'Aragón' },
    { province: 'TOLEDO', community: 'Castilla-La Mancha' },
    { province: 'VALENCIA/VALÈNCIA', community: 'Comunidad Valenciana' },
    { province: 'VALLADOLID', community: 'Castilla y León' },
    { province: 'ZAMORA', community: 'Castilla y León' },
    { province: 'ZARAGOZA', community: 'Aragón' },
    { province: 'ÁLAVA/ARABA', community: 'País Vasco' },
    { province: 'ÁVILA', community: 'Castilla y León' },
  ];

  const { error } = await supabase
    .from('autonomous_communities')
    .insert(communityMapping);

  if (error) {
    console.error('Error importing communities:', error);
  } else {
    console.log('Autonomous communities imported successfully!');
  }
}

// Run import
importData();
