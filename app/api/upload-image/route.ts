import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const category = formData.get('category') as string;
        const productName = formData.get('productName') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!category) {
            return NextResponse.json({ error: 'No category provided' }, { status: 400 });
        }

        // Sanitize category and product name for folder/file names
        const sanitizeName = (name: string) => {
            return name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        const sanitizedCategory = sanitizeName(category);
        const sanitizedProductName = sanitizeName(productName || 'image');

        // Create category folder path
        const categoryFolder = join(process.cwd(), 'public', 'images', sanitizedCategory);
        
        // Ensure category folder exists
        if (!existsSync(categoryFolder)) {
            await mkdir(categoryFolder, { recursive: true });
        }

        // Get file extension
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${sanitizedProductName}.${fileExtension}`;
        const filePath = join(categoryFolder, fileName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Return the public path
        const publicPath = `/images/${sanitizedCategory}/${fileName}`;

        return NextResponse.json({ 
            success: true, 
            path: publicPath,
            size: file.size
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' }, 
            { status: 500 }
        );
    }
}

