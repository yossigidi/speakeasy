import { handleCors } from './_lib/cors.js';

// Israeli supermarket chain names mapping
const CHAIN_NAMES = {
  '7290027600007': 'רמי לוי',
  '7290700100008': 'שופרסל',
  '7290058140886': 'מגה',
  '7290058148394': 'מגה',
  '7290696200003': 'אושר עד',
  '7291059100008': 'יינות ביתן',
  '7290058179985': 'ויקטורי',
  '7290873255550': 'יוחננוף',
  '7290785400000': 'חצי חינם',
  '7291056200008': 'Stop Market',
  '7290633800006': 'קרפור (פרשמרקט)',
  '7290058108879': 'דור אלון',
};

// Search Open Food Facts for product info by barcode
async function lookupBarcode(barcode) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1) return null;
    const p = data.product;
    return {
      name: p.product_name_he || p.product_name || p.generic_name || null,
      image: p.image_front_url || p.image_url || null,
      brand: p.brands || null,
      quantity: p.quantity || null,
      categories: p.categories || null,
    };
  } catch {
    return null;
  }
}

// Search Israeli open prices database (Prices.co.il API / government data)
// Using the open Israeli supermarket prices API
async function searchPrices(productName) {
  try {
    // Try the open prices IL API
    const encodedName = encodeURIComponent(productName);
    const res = await fetch(`https://prices.shufersal.co.il/api/items/search?q=${encodedName}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.items?.length > 0) {
        return data.items.map(item => ({
          chain: item.chain_name || 'לא ידוע',
          name: item.item_name,
          price: item.price,
          unitPrice: item.unit_price || null,
        }));
      }
    }
  } catch {
    // Fallback below
  }

  // Fallback: search via Israeli government open data proxy
  try {
    const encodedName = encodeURIComponent(productName);
    const res = await fetch(`https://www.trolley.co.il/api/search?q=${encodedName}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(item => ({
          chain: item.chain || item.store || 'לא ידוע',
          name: item.name || item.product_name,
          price: parseFloat(item.price),
          unitPrice: item.unit_price ? parseFloat(item.unit_price) : null,
        }));
      }
    }
  } catch {
    // Fallback below
  }

  // Final fallback: use Chp (חנות פרייס) open API
  try {
    const encodedName = encodeURIComponent(productName);
    const res = await fetch(`https://chp.co.il/autocompletion/${encodedName}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Get prices for the first matching product
        const productId = data[0]?.id;
        if (productId) {
          const pricesRes = await fetch(`https://chp.co.il/price_compare/${productId}`, {
            headers: { 'Accept': 'application/json' },
          });
          if (pricesRes.ok) {
            const pricesData = await pricesRes.json();
            if (pricesData?.prices) {
              return Object.entries(pricesData.prices).map(([chain, price]) => ({
                chain,
                name: data[0].name || productName,
                price: parseFloat(price),
                unitPrice: null,
              }));
            }
          }
        }
      }
    }
  } catch {
    // All APIs failed
  }

  return null;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { action, q, barcode } = req.query;

  try {
    if (action === 'barcode' && barcode) {
      // Lookup product by barcode
      const product = await lookupBarcode(barcode);
      if (!product) {
        return res.status(200).json({ found: false });
      }

      // Also search for prices if we got a product name
      let prices = null;
      if (product.name) {
        prices = await searchPrices(product.name);
      }

      return res.status(200).json({
        found: true,
        product,
        prices: prices || [],
      });
    }

    if (action === 'search' && q) {
      // Search by product name
      const prices = await searchPrices(q);
      return res.status(200).json({
        prices: prices || [],
        query: q,
      });
    }

    return res.status(400).json({ error: 'Missing action or query parameter' });
  } catch (err) {
    console.error('Compare API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
