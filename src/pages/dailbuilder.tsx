import { useState } from 'react';
import WorkDrawer3 from '../components/WorkDrawer3';

export default function DailBuilder() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Daily Review</button>
      <WorkDrawer3 isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}

DailylBuilder.useLayout = false;