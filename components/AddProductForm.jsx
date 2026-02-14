"use client"
import React, { useState } from 'react'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { AuthModel } from './AuthModel';
import { addProduct } from '@/app/action';
import { toast } from 'sonner';

const AddProductForm = ({ user }) => {

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true)
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("url", url)

    const response = await addProduct(formData);

    if (response.error) {
      toast.error(response.error);

    } else {
      toast.success(response.message || "Product added successfully!")
      setUrl("");
    }
    setLoading(false);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className='w-full max-w-2xl mx-auto '>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="paste a product URL (Amazon, Walmat etc.)"
            className="h-12 text-base"
            type="url"
            required
            disabled={loading} />

          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 sm:h-12 px-8 text-white"
            disabled={loading}
            size='lg'>

            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animete-spin' />
                Adding...
              </>
            ) : ("Track Price")}
          </Button>
        </div>
      </form>

      {/*  Auth Model */}

      <AuthModel
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false) }}
      />

    </>
  )
}

export default AddProductForm;