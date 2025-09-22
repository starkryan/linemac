import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { bunnyCDN } from '@/lib/bunny-cdn'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json({ error: 'No photo file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const userId = session.user.id
    const fileExtension = file.name.split('.').pop()
    const filename = `kyc/${userId}/${Date.now()}.${fileExtension}`

    const uploadResult = await bunnyCDN.uploadFile(file, filename, file.type)

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 })
    }

    await query(
      `UPDATE "user"
       SET kyc_photo_url = $1, kyc_status = 'photo_uploaded'
       WHERE id = $2`,
      [uploadResult.url, userId]
    )

    return NextResponse.json({
      success: true,
      photoUrl: uploadResult.url,
      message: 'Photo uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading KYC photo:', error)
    return NextResponse.json({
      error: 'Failed to upload photo'
    }, { status: 500 })
  }
}