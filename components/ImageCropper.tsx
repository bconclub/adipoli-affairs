"use client";

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import { getCroppedImg } from '@/lib/imageCrop';

interface ImageCropperProps {
    image: string;
    aspectRatio?: number;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
}

export default function ImageCropper({ 
    image, 
    aspectRatio = 16 / 9, 
    onCropComplete, 
    onCancel 
}: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [cropping, setCropping] = useState(false);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    const onCropCompleteCallback = useCallback((croppedArea: any, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropComplete = useCallback(async () => {
        if (!croppedAreaPixels) {
            alert('Please adjust the crop area first');
            return;
        }
        
        setCropping(true);
        try {
            const croppedImage = await getCroppedImg(image, croppedAreaPixels, aspectRatio);
            onCropComplete(croppedImage);
        } catch (error) {
            console.error('Crop error:', error);
            alert('Failed to crop image');
        } finally {
            setCropping(false);
        }
    }, [image, croppedAreaPixels, aspectRatio, onCropComplete]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
                height: '80vh',
                position: 'relative',
                backgroundColor: '#000',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropCompleteCallback}
                    style={{
                        containerStyle: {
                            width: '100%',
                            height: '100%',
                        }
                    }}
                />
            </div>
            
            <div style={{
                marginTop: '1rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                width: '100%',
                maxWidth: '800px'
            }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'white' }}>
                        Zoom: {zoom.toFixed(2)}x
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        style={{ width: '100%' }}
                    />
                </div>
                
                <button
                    onClick={onCancel}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <X size={20} />
                    Cancel
                </button>
                
                <button
                    onClick={handleCropComplete}
                    disabled={cropping}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--primary)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: cropping ? 'not-allowed' : 'pointer',
                        opacity: cropping ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                    }}
                >
                    <Check size={20} />
                    {cropping ? 'Processing...' : 'Apply Crop'}
                </button>
            </div>
            
            <p style={{ 
                marginTop: '1rem', 
                color: 'var(--text-secondary)', 
                fontSize: '0.85rem',
                textAlign: 'center'
            }}>
                Crop to 16:9 aspect ratio. Drag to reposition, use zoom to adjust.
            </p>
        </div>
    );
}

