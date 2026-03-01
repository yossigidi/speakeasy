import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Camera, MapPin, Plus, Search, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { t } from '../utils/translations.js';

export default function BarcodeComparisonPage({ onBack }) {
  const { uiLang, dir } = useTheme();
  const isRtl = dir === 'rtl';

  // Scanner state
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const lastDetectedRef = useRef(null);
  const isMountedRef = useRef(true);

  // Product state
  const [barcodeResult, setBarcodeResult] = useState(null);
  const [scannedProductName, setScannedProductName] = useState(null);
  const [productLoading, setProductLoading] = useState(false);

  // Price state
  const [barcodePriceResults, setBarcodePriceResults] = useState(null);
  const [barcodePriceLoading, setBarcodePriceLoading] = useState(false);

  // Location state
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('lastUserLocation'));
      if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
        return { lat: cached.lat, lng: cached.lng };
      }
    } catch (e) {
      console.warn('Failed to read cached location:', e);
    }
    return null;
  });

  // Added-to-list tracking
  const [addedToList, setAddedToList] = useState(false);

  // Manual barcode entry
  const [manualBarcode, setManualBarcode] = useState('');

  // Track mounted state for async operations
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Request user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!isMountedRef.current) return;
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        try {
          localStorage.setItem('lastUserLocation', JSON.stringify({ ...loc, timestamp: Date.now() }));
        } catch {}
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // Stop scanner - defined before startScanner so it can be referenced
  const stopScanner = useCallback((clearResults = true) => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);

    if (clearResults) {
      setBarcodeResult(null);
      setScannedProductName(null);
      setBarcodePriceResults(null);
      setBarcodePriceLoading(false);
      setProductLoading(false);
      setAddedToList(false);
    }
  }, []);

  // Fetch prices from our API
  const fetchPrices = useCallback(async (productName) => {
    if (!isMountedRef.current) return;
    setBarcodePriceLoading(true);
    try {
      const res = await fetch(`/api/compare?action=search&q=${encodeURIComponent(productName)}`);
      if (!isMountedRef.current) return;
      if (!res.ok) {
        setBarcodePriceResults([]);
        return;
      }
      const data = await res.json();
      if (!isMountedRef.current) return;
      if (data.prices && data.prices.length > 0) {
        const sorted = [...data.prices].sort((a, b) => a.price - b.price);
        setBarcodePriceResults(sorted);
      } else {
        setBarcodePriceResults([]);
      }
    } catch (err) {
      console.warn('Price fetch failed:', err);
      if (isMountedRef.current) setBarcodePriceResults([]);
    } finally {
      if (isMountedRef.current) setBarcodePriceLoading(false);
    }
  }, []);

  // Handle detected barcode
  const handleBarcodeDetected = useCallback(async (barcode) => {
    // Stop scanning but keep results area
    stopScanner(false);

    // Vibrate for feedback (not supported on iOS, fails silently)
    try { navigator.vibrate?.(100); } catch {}

    if (!isMountedRef.current) return;
    setProductLoading(true);

    // Lookup product via Open Food Facts
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`);
      if (!isMountedRef.current) return;

      if (!res.ok) {
        setBarcodeResult({ found: false, barcode });
        setProductLoading(false);
        return;
      }

      const data = await res.json();
      if (!isMountedRef.current) return;

      if (data.status === 1 && data.product) {
        const p = data.product;
        const productName = p.product_name_he || p.product_name || p.generic_name || barcode;
        const productInfo = {
          found: true,
          barcode,
          name: productName,
          image: p.image_front_url || p.image_url || null,
          brand: p.brands || null,
          quantity: p.quantity || null,
        };
        setBarcodeResult(productInfo);
        setScannedProductName(productName);
        setProductLoading(false);

        // Auto-fetch prices
        fetchPrices(productName);
      } else {
        setBarcodeResult({ found: false, barcode });
        setProductLoading(false);
      }
    } catch (err) {
      console.warn('Product lookup failed:', err);
      if (isMountedRef.current) {
        setBarcodeResult({ found: false, barcode });
        setProductLoading(false);
      }
    }
  }, [stopScanner, fetchPrices]);

  // Start barcode scanner
  const startScanner = useCallback(async () => {
    setCameraError(null);
    setBarcodeResult(null);
    setScannedProductName(null);
    setBarcodePriceResults(null);
    setBarcodePriceLoading(false);
    setProductLoading(false);
    setAddedToList(false);
    lastDetectedRef.current = null;

    // Request location in parallel (non-blocking)
    if (!userLocation) {
      getUserLocation();
    }

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        }
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      // Try native BarcodeDetector API (Chrome/Edge, NOT Safari/iOS)
      if ('BarcodeDetector' in window) {
        try {
          const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
          });

          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                if (code && code !== lastDetectedRef.current) {
                  lastDetectedRef.current = code;
                  handleBarcodeDetected(code);
                }
              }
            } catch (e) {
              console.warn('Detection cycle error:', e);
            }
          }, 300);
        } catch (e) {
          console.warn('BarcodeDetector init failed:', e);
          // Fall through — user can still use manual entry
        }
      }
      // On Safari/iOS: camera preview shows but detection relies on manual entry.
      // The UI shows the manual entry field below the camera.

    } catch (err) {
      console.error('Camera error:', err);
      // Clean up stream if it was partially acquired
      if (stream) stream.getTracks().forEach(track => track.stop());
      setCameraError(err.name === 'NotAllowedError' ? 'permission' : 'general');
      setScanning(false);
    }
  }, [userLocation, getUserLocation, handleBarcodeDetected]);

  // Navigate to store via Google Maps
  const navigateToStore = useCallback((chainName) => {
    if (!userLocation) return;
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(chainName)}/@${userLocation.lat},${userLocation.lng},14z`;
    window.open(mapsUrl, '_blank');
  }, [userLocation]);

  // Manual search on external sites
  const openManualSearch = useCallback(() => {
    const name = scannedProductName || barcodeResult?.barcode || '';
    window.open(`https://www.zap.co.il/search.aspx?keyword=${encodeURIComponent(name)}`, '_blank');
  }, [scannedProductName, barcodeResult]);

  // Add to shopping list (localStorage)
  const addToShoppingList = useCallback(() => {
    if (!scannedProductName) return;
    try {
      const raw = localStorage.getItem('shoppingList');
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        name: scannedProductName,
        barcode: barcodeResult?.barcode,
        addedAt: Date.now(),
      });
      localStorage.setItem('shoppingList', JSON.stringify(list));
      setAddedToList(true);
    } catch (e) {
      console.warn('Failed to save to shopping list:', e);
    }
  }, [scannedProductName, barcodeResult]);

  const handleManualSubmit = useCallback(() => {
    const trimmed = manualBarcode.trim();
    if (/^\d{8,14}$/.test(trimmed)) {
      handleBarcodeDetected(trimmed);
      setManualBarcode('');
    }
  }, [manualBarcode, handleBarcodeDetected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Check if native detection is available
  const hasNativeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  // Price savings calculation
  const savings = barcodePriceResults && barcodePriceResults.length >= 2
    ? (barcodePriceResults[barcodePriceResults.length - 1].price - barcodePriceResults[0].price).toFixed(2)
    : null;

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 40%, #F0F9FF 40.1%, #ECFDF5 100%)',
      paddingBottom: 32,
    }}>
      {/* Header */}
      <div style={{
        padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 20px',
        color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button
            onClick={() => { stopScanner(); onBack(); }}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.1)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            }}
          >
            <ArrowLeft size={20} style={isRtl ? { transform: 'scaleX(-1)' } : undefined} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', flex: 1 }}>
            {t('priceComparison', uiLang)}
          </h1>
          <div style={{ width: 44 }} />
        </div>
        <p style={{ textAlign: 'center', fontSize: 14, opacity: 0.8 }}>
          {t('scanBarcodeDesc', uiLang)}
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 16px' }}>
        {/* Scanner Area */}
        {scanning ? (
          <div style={{
            position: 'relative',
            borderRadius: 20,
            overflow: 'hidden',
            background: '#000',
            marginBottom: 16,
          }}>
            {/* Wrapper for aspect ratio (Safari-safe) */}
            <div style={{ position: 'relative', paddingBottom: '75%' }}>
              <video
                ref={videoRef}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', objectFit: 'cover',
                }}
                playsInline
                muted
                autoPlay
              />
              {/* Scanning overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Scanning frame */}
                <div style={{
                  width: '70%', height: '40%',
                  border: '3px solid rgba(20, 184, 166, 0.8)',
                  borderRadius: 12,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                  position: 'relative',
                }}>
                  {/* Animated scan line */}
                  <div style={{
                    position: 'absolute', left: 4, right: 4,
                    height: 2, background: 'linear-gradient(90deg, transparent, #14b8a6, transparent)',
                    animation: 'scanLine 2s ease-in-out infinite',
                    top: '50%',
                  }} />
                </div>
                <p style={{ color: 'white', marginTop: 16, fontSize: 14, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {t('pointCameraAtBarcode', uiLang)}
                </p>
              </div>
              {/* Stop button */}
              <button
                onClick={() => stopScanner()}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)', border: 'none',
                  color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* iOS/Safari notice: no native detection */}
            {!hasNativeDetector && (
              <div style={{
                padding: '10px 16px',
                background: '#FEF3C7', textAlign: 'center',
                fontSize: 13, color: '#92400E',
              }}>
                {uiLang === 'he' || uiLang === 'ar'
                  ? 'סריקה אוטומטית לא נתמכת בדפדפן זה. הזינו ברקוד ידנית למטה.'
                  : uiLang === 'ru'
                    ? 'Автосканирование не поддерживается. Введите штрих-код вручную ниже.'
                    : 'Auto-scanning not supported in this browser. Enter barcode manually below.'
                }
              </div>
            )}
          </div>
        ) : !barcodeResult && !productLoading ? (
          /* Start scanner / manual entry */
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={startScanner}
              style={{
                width: '100%', padding: '20px 24px',
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                border: 'none', borderRadius: 16, cursor: 'pointer',
                color: 'white', fontSize: 18, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                boxShadow: '0 4px 16px rgba(20,184,166,0.3)',
                minHeight: 56,
              }}
            >
              <Camera size={24} />
              {t('scanBarcode', uiLang)}
            </button>

            {cameraError && (
              <div style={{
                marginTop: 12, padding: '12px 16px',
                background: '#FEF2F2', borderRadius: 12,
                color: '#991B1B', fontSize: 14, textAlign: 'center',
              }}>
                {cameraError === 'permission'
                  ? t('cameraPermissionDenied', uiLang)
                  : t('error', uiLang)
                }
              </div>
            )}
          </div>
        ) : null}

        {/* Manual barcode entry - shown both when idle and when scanning on iOS */}
        {(!barcodeResult && !productLoading) && (
          <div style={{
            marginBottom: 16, display: 'flex', gap: 8,
            alignItems: 'center',
          }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={uiLang === 'he' || uiLang === 'ar' ? 'הזינו ברקוד ידנית...' : 'Enter barcode manually...'}
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              style={{
                flex: 1, padding: '14px 16px',
                border: '2px solid #E5E7EB', borderRadius: 12,
                fontSize: 16, outline: 'none',
                direction: 'ltr', textAlign: 'left',
                WebkitAppearance: 'none',
                minHeight: 48,
              }}
            />
            <button
              onClick={handleManualSubmit}
              disabled={!/^\d{8,14}$/.test(manualBarcode.trim())}
              style={{
                padding: '14px 16px', borderRadius: 12,
                background: /^\d{8,14}$/.test(manualBarcode.trim()) ? '#14b8a6' : '#D1D5DB',
                border: 'none', color: 'white', cursor: 'pointer',
                fontWeight: 600, fontSize: 14,
                minWidth: 48, minHeight: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Search size={20} />
            </button>
          </div>
        )}

        {/* Product Loading */}
        {productLoading && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 24,
            marginBottom: 16, textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}>
            <div role="status" aria-label={t('loading', uiLang)} style={{
              width: 40, height: 40, margin: '0 auto 12px',
              border: '3px solid #E5E7EB', borderTopColor: '#14b8a6',
              borderRadius: '50%', animation: 'spin 1s linear infinite',
            }} />
            <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>
              {t('loading', uiLang)}
            </p>
          </div>
        )}

        {/* Product Card */}
        {barcodeResult?.found && (
          <div style={{
            background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
            borderRadius: 16, padding: 16, marginBottom: 16,
            border: '1px solid #A7F3D0',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {barcodeResult.image && (
                <img
                  src={barcodeResult.image}
                  alt={barcodeResult.name}
                  style={{
                    width: 64, height: 64, borderRadius: 12,
                    objectFit: 'cover', background: 'white',
                    border: '1px solid #E5E7EB',
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginBottom: 2 }}>
                  {t('productFound', uiLang)}
                </p>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#064E3B', marginBottom: 2, wordBreak: 'break-word' }}>
                  {barcodeResult.name}
                </h3>
                {barcodeResult.brand && (
                  <p style={{ fontSize: 13, color: '#6B7280' }}>{barcodeResult.brand}</p>
                )}
                {barcodeResult.quantity && (
                  <p style={{ fontSize: 12, color: '#9CA3AF' }}>{barcodeResult.quantity}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Not Found */}
        {barcodeResult && !barcodeResult.found && (
          <div style={{
            background: '#FEF3C7', borderRadius: 16, padding: 16, marginBottom: 16,
            border: '1px solid #FCD34D', textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: '#92400E', fontWeight: 600, marginBottom: 4 }}>
              {t('productNotFound', uiLang)}
            </p>
            <p style={{ fontSize: 12, color: '#B45309', direction: 'ltr' }}>
              {barcodeResult.barcode}
            </p>
          </div>
        )}

        {/* Price Loading */}
        {barcodePriceLoading && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 24,
            marginBottom: 16, textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}>
            <div role="status" aria-label={t('comparingPrices', uiLang)} style={{
              width: 40, height: 40, margin: '0 auto 12px',
              border: '3px solid #E5E7EB', borderTopColor: '#14b8a6',
              borderRadius: '50%', animation: 'spin 1s linear infinite',
            }} />
            <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>
              {t('comparingPrices', uiLang)}
            </p>
          </div>
        )}

        {/* Price Results */}
        {barcodePriceResults && barcodePriceResults.length > 0 && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 16,
            marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 12 }}>
              {t('priceComparison', uiLang)}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {barcodePriceResults.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', borderRadius: 12,
                    background: idx === 0
                      ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)'
                      : '#F9FAFB',
                    border: idx === 0 ? '2px solid #34D399' : '1px solid #F3F4F6',
                    minHeight: 52,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#1F2937' }}>
                        {item.chain}
                      </span>
                      {idx === 0 && (
                        <span style={{
                          background: '#059669', color: 'white',
                          fontSize: 10, fontWeight: 700, padding: '2px 8px',
                          borderRadius: 99, whiteSpace: 'nowrap',
                        }}>
                          {t('cheapestBadge', uiLang)}
                        </span>
                      )}
                    </div>
                    {item.name && item.name !== scannedProductName && (
                      <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, wordBreak: 'break-word' }}>
                        {item.name}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 18, fontWeight: 700,
                      color: idx === 0 ? '#059669' : '#374151',
                      direction: 'ltr', whiteSpace: 'nowrap',
                    }}>
                      {'\u20AA'}{item.price.toFixed(2)}
                    </span>

                    {userLocation && (
                      <button
                        onClick={() => navigateToStore(item.chain)}
                        aria-label={`${t('navigateToStore', uiLang)} - ${item.chain}`}
                        style={{
                          width: 44, height: 44, borderRadius: '50%',
                          border: 'none', cursor: 'pointer',
                          background: '#EFF6FF', color: '#2563EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <MapPin size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Possible savings */}
            {savings && parseFloat(savings) > 0 && (
              <div style={{
                marginTop: 12, padding: '10px 14px',
                background: '#F0FDF4', borderRadius: 10,
                textAlign: 'center',
              }}>
                <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>
                  {t('possibleSavings', uiLang)}: {'\u20AA'}{savings}
                </span>
              </div>
            )}
          </div>
        )}

        {/* No prices found */}
        {barcodePriceResults && barcodePriceResults.length === 0 && (
          <div style={{
            background: 'white', borderRadius: 16, padding: 20,
            marginBottom: 16, textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
              {t('noPriceDataForProduct', uiLang)}
            </p>
            <button
              onClick={openManualSearch}
              style={{
                padding: '12px 20px', borderRadius: 10,
                background: '#EFF6FF', border: '1px solid #BFDBFE',
                color: '#2563EB', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', gap: 6,
                minHeight: 44,
              }}
            >
              <Search size={16} />
              {t('searchManually', uiLang)}
            </button>
          </div>
        )}

        {/* Action buttons when product found */}
        {barcodeResult?.found && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={addToShoppingList}
              disabled={addedToList}
              style={{
                flex: 1, padding: '14px 16px', borderRadius: 12,
                background: addedToList
                  ? '#D1FAE5'
                  : 'linear-gradient(135deg, #14b8a6, #0d9488)',
                border: 'none', color: addedToList ? '#059669' : 'white',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                minHeight: 48,
              }}
            >
              <Plus size={16} />
              {addedToList
                ? (uiLang === 'he' || uiLang === 'ar' ? 'נוסף!' : uiLang === 'ru' ? 'Добавлено!' : 'Added!')
                : t('addScannedProduct', uiLang)
              }
            </button>
            <button
              onClick={() => {
                setBarcodeResult(null);
                setScannedProductName(null);
                setBarcodePriceResults(null);
                setBarcodePriceLoading(false);
                setProductLoading(false);
                setAddedToList(false);
                lastDetectedRef.current = null;
              }}
              style={{
                padding: '14px 16px', borderRadius: 12,
                background: '#F3F4F6', border: 'none',
                color: '#374151', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                minHeight: 48,
              }}
            >
              <Camera size={16} />
              {t('scanAgain', uiLang)}
            </button>
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 10%; opacity: 0.5; }
          50% { top: 90%; opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
