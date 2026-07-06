import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn()', () => {
  it('returns empty string when called with no arguments', () => {
    expect(cn()).toBe('')
  })

  it('returns the class when given a single string', () => {
    expect(cn('bg-primary')).toBe('bg-primary')
  })

  it('concatenates multiple class strings', () => {
    expect(cn('text-sm', 'font-medium')).toBe('text-sm font-medium')
  })

  it('ignores falsy value: undefined', () => {
    expect(cn('p-4', undefined)).toBe('p-4')
  })

  it('ignores falsy value: null', () => {
    expect(cn('p-4', null)).toBe('p-4')
  })

  it('ignores falsy value: false', () => {
    expect(cn('p-4', false)).toBe('p-4')
  })

  it('ignores falsy value: empty string', () => {
    expect(cn('p-4', '')).toBe('p-4')
  })

  it('ignores falsy value: 0', () => {
    expect(cn('p-4', 0)).toBe('p-4')
  })

  it('applies conditional classes via object (key=class, value=boolean)', () => {
    expect(cn({ 'bg-primary': true, 'bg-muted': false })).toBe('bg-primary')
  })

  it('combines string and conditional object', () => {
    expect(cn('text-sm', { 'font-bold': true, italic: false })).toBe('text-sm font-bold')
  })

  it('accepts arrays of classes', () => {
    expect(cn(['text-sm', 'font-medium'])).toBe('text-sm font-medium')
  })

  it('accepts nested arrays with falsy values', () => {
    const isActive = false
    expect(cn(['p-4', isActive && 'p-8', undefined])).toBe('p-4')
  })

  it('resolves padding conflict (tailwind-merge: last class wins)', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('resolves background color conflict', () => {
    expect(cn('bg-primary', 'bg-destructive')).toBe('bg-destructive')
  })

  it('resolves font size conflict', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('preserves non-conflicting classes alongside conflict resolution', () => {
    expect(cn('flex items-center p-4', 'p-2')).toBe('flex items-center p-2')
  })

  it('allows overriding a base class via a later argument', () => {
    const base = 'rounded-md bg-primary text-primary-foreground'
    const override = 'bg-destructive'
    expect(cn(base, override)).toBe('rounded-md text-primary-foreground bg-destructive')
  })

  it('combines all input forms: strings, objects and arrays', () => {
    const result = cn('flex', ['items-center', 'gap-2'], { 'p-4': true, hidden: false })
    expect(result).toBe('flex items-center gap-2 p-4')
  })
})
