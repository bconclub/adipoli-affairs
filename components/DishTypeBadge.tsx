import { DISH_TYPES, getDishTypes, type MenuItem } from '@/lib/menuData';

// Indian-style food marker: a coloured square with a dot inside
export function DishTypeMark({ color, size = 12 }: { color: string; size?: number }) {
    return (
        <span
            aria-hidden="true"
            style={{
                width: size,
                height: size,
                border: `1.5px solid ${color}`,
                borderRadius: 2,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: 'white',
            }}
        >
            <span style={{ width: size / 2, height: size / 2, borderRadius: '50%', background: color }} />
        </span>
    );
}

export default function DishTypeBadge({ item }: { item: Pick<MenuItem, 'name' | 'diet'> }) {
    const types = DISH_TYPES.filter(type => getDishTypes(item).includes(type.id));
    if (types.length === 0) return null;
    // Any meat or fish makes the dish non-veg, so show red over yellow over green
    const color = types.some(type => type.color === '#dc2626') ? '#dc2626' : types.some(type => type.id === 'egg') ? '#eab308' : '#16a34a';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <DishTypeMark color={color} />
            {types.map(type => type.label).join(' · ')}
        </div>
    );
}
