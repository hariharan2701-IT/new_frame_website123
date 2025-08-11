import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Package, ShoppingCart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Database } from '../lib/supabase'

type Product = Database['public']['Tables']['products']['Row']
type Order = Database['public']['Tables']['orders']['Row']

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image_file: null as File | null,
    image_url: '',
    size: '',
    category: '',
    material: 'matt',
    stock_quantity: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Admin email check
    if (user.email !== '7708554879@gmail.com') {
      navigate('/')
      return
    }

    fetchProducts()
    fetchOrders()
  }, [user, navigate])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductForm({ ...productForm, image_file: file })
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setProductForm(prev => ({ ...prev, image_url: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let imageUrl = productForm.image_url
    
    // If a file was uploaded, we'll use the preview URL for now
    // In a real app, you'd upload to a storage service like Supabase Storage
    if (productForm.image_file) {
      // For demo purposes, we'll use the data URL
      // In production, upload to Supabase Storage and get the public URL
      imageUrl = productForm.image_url
    }
    
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          image_url: imageUrl,
          size: productForm.size,
          category: productForm.category,
          material: productForm.material,
          dimensions: productForm.size,
          stock_quantity: parseInt(productForm.stock_quantity),
          featured: false
        })

      if (error) throw error

      setProductForm({
        name: '',
        description: '',
        price: '',
        image_file: null,
        image_url: '',
        size: '',
        category: '',
        material: 'matt',
        stock_quantity: ''
      })
      setShowAddProduct(false)
      fetchProducts()
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Error adding product. Please try again.')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product. Please try again.')
    }
  }

  if (!user || user.email !== '7708554879@gmail.com') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage products and track orders</p>
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 font-semibold text-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="w-5 h-5 inline mr-2" />
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                Orders ({orders.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-12 border-2 border-dashed border-amber-300">
                      <Package className="w-20 h-20 text-amber-400 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Available Yet</h3>
                      <p className="text-gray-600 mb-8 text-lg">Add your first product to make it available for customers</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                        <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                          <div className="space-y-1 text-sm text-gray-600 mb-3">
                            <p>Size: {product.size}</p>
                            <p>Material: {product.material}</p>
                            <p>Category: {product.category}</p>
                            <p>Stock: {product.stock_quantity}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-amber-600">₹{product.price}</span>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white border rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(order.created_at).toLocaleDateString('en-IN')}
                            </p>
                            <p className="text-sm text-gray-600">Status: {order.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-600">₹{order.total_amount}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600">
                            <strong>Shipping Address:</strong> {order.shipping_address}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Frame</h2>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-6">
              {/* Frame Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors">
                  {productForm.image_url ? (
                    <div className="space-y-4">
                      <img
                        src={productForm.image_url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, image_file: null, image_url: '' })}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload frame image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        required
                      />
                      <label
                        htmlFor="image-upload"
                        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 cursor-pointer inline-block transition-colors"
                      >
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frame Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Premium Photo Frame"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Frame Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Size *
                  </label>
                  <select
                    value={productForm.size}
                    onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select Size</option>
                    <option value="4x6">4x6 inches</option>
                    <option value="5x7">5x7 inches</option>
                    <option value="8x10">8x10 inches</option>
                    <option value="8x12">8x12 inches</option>
                    <option value="11x14">11x14 inches</option>
                    <option value="12x18">12x18 inches</option>
                    <option value="16x20">16x20 inches</option>
                    <option value="18x24">18x24 inches</option>
                  </select>
                </div>

                {/* Frame Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Rate (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      placeholder="299"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      min="1"
                      className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Frame Finish */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Finish *
                  </label>
                  <select
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="matt">Matt Finish</option>
                    <option value="glassy">Glassy Finish</option>
                  </select>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    required
                    min="0"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Colors/Category *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Black, White, Brown"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    required
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frame Description *
                </label>
                <textarea
                  placeholder="Describe the frame features, quality, and any special details..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}