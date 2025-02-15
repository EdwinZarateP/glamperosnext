"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface ManejoErroresProps {
  children: ReactNode;
}

interface ManejoErroresState {
  hasError: boolean;
}

class ManejoErrores extends Component<ManejoErroresProps, ManejoErroresState> {
  constructor(props: ManejoErroresProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ManejoErroresState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ManejoErrores caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <h2>
          Algo salió mal al cargar el mapa. Por favor, intenta más tarde.
        </h2>
      );
    }
    return this.props.children;
  }
}

export default ManejoErrores;
