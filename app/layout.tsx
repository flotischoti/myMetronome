import React from 'react';
import './globals.scss';
import './styles.module.scss';
import Navbar from '../components/Navbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head />
      <body className="container mx-auto">
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
