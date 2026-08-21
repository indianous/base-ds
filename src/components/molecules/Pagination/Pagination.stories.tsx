import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './Pagination'

const meta: Meta<typeof Pagination> = {
  component: Pagination,
  title: 'Molecules/Pagination',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  args: { currentPage: 3, totalPages: 10, onPageChange: () => {} },
}

export const FirstPage: Story = {
  args: { currentPage: 1, totalPages: 10, onPageChange: () => {} },
}

export const LastPage: Story = {
  args: { currentPage: 10, totalPages: 10, onPageChange: () => {} },
}

export const NoEdges: Story = {
  args: { currentPage: 5, totalPages: 10, onPageChange: () => {}, showEdges: false },
}

export const FewPages: Story = {
  args: { currentPage: 2, totalPages: 3, onPageChange: () => {} },
}

function InteractivePagination() {
  const [page, setPage] = useState(1)
  return <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
}

export const Interactive: Story = {
  render: () => <InteractivePagination />,
}
