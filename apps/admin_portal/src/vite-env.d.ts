/// <reference types="vite/client" />

declare module 'react-csv' {
  import { Component } from 'react';

  export interface CSVLinkProps {
    data: any[];
    headers?: Array<{ label: string; key: string }>;
    filename?: string;
    separator?: string;
    enclosingCharacter?: string;
    onClick?: (event: any, done: () => void) => void | boolean;
    asyncOnClick?: boolean;
    target?: string;
    uFEFF?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export class CSVLink extends Component<CSVLinkProps> {}
}
