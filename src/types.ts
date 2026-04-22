export type MemberName =
  | 'Lance'
  | 'Ricky'
  | 'Jacob'
  | 'William'
  | 'Carlos'
  | 'Daniel'
  | 'Logan'

export type Member = {
  name: MemberName
  color: string
}

export type ChallengePost = {
  id: string
  title: string
  weekLabel: string
  author: MemberName
  description: string
  initialRanking?: MemberName[]
  answers?: Partial<Record<MemberName, string>>
  notes?: Partial<Record<MemberName, string>>
}

