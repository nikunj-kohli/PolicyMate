import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[12px] border border-red-200 bg-red-50 p-6 text-sm text-red-900">
          Something went wrong. Refresh the page or try again.
        </div>
      )
    }
    return this.props.children
  }
}
