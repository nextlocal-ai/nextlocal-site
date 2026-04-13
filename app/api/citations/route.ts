import { NextRequest, NextResponse } from 'next/server';
import { checkCitations } from '@/lib/citations';

export async function GET(req: NextRequest) {
  const businessName = req.nextUrl.searchParams.get('businessName');
  const cityState = req.nextUrl.searchParams.get('cityState');

  if (!businessName || !cityState) {
    return NextResponse.json(
      { error: 'Missing required parameters: businessName and cityState' },
      { status: 400 }
    );
  }

  const result = await checkCitations(businessName, cityState);
  return NextResponse.json(result);
}
