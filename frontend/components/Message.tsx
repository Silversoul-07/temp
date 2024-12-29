'use client';
import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const LogoutMsg: React.FC = () => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hidden">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Logged Out</DialogTitle>
        <DialogDescription>
          You have been logged out.
        </DialogDescription>
        <DialogFooter>
          <Button onClick={handleClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutMsg;