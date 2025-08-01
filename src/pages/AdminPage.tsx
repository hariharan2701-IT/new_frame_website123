import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Package, Users, ShoppingCart } from 'lucide-react'
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
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
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
    
    // Check if user is admin based on email
    if (user.email !== '7708554879@gmail.com') {
      navigate('/')
      return
    }

    fetchProducts()
    fetchOrders()
  }, [user, navigate])

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
    
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          image_url: productForm.image_url,
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-gray-600">Manage products and track orders</p>
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-lg"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-semibold">Add New Frame</span>
                    </button>
                  </div>
                </div>

                {/* Add Product Form */}
                {showAddProduct && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 mb-8 border-2 border-amber-200 shadow-lg">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Add New Frame Product</h3>
                    </div>
                    <p className="text-gray-600 mb-6">Fill in all the details below to add a new frame to your shop. Make sure to include a high-quality image URL.</p>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frame Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Enter frame name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frame Picture URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={productForm.image_url}
                          onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frame Size *
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.size}
                          onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="e.g., 8x10, 11x14, 16x20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Colors Available *
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="e.g., Black, White, Brown"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Enter price in rupees"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Finish Type *
                        </label>
                        <select
                          required
                          value={productForm.material}
                          onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="matt">Matt Finish</option>
                          <option value="glassy">Glassy Finish</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Enter stock quantity"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          required
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          rows={3}
                          placeholder="Enter product description"
                        />
                      </div>

                      <div className="md:col-span-2 flex space-x-4">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                        >
                          ✅ Add Frame to Shop
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddProduct(false)}
                          className="bg-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-400 transition-all duration-300 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products List */}
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-12 border-2 border-dashed border-amber-300">
                      <Package className="w-20 h-20 text-amber-400 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">No Frames Available Yet</h3>
                      <p className="text-gray-600 mb-8 text-lg">Add your first frame to make it available for customers to purchase</p>
                      <button
                        onClick={() => setShowAddProduct(true)}
                        className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-4 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto shadow-lg text-lg font-semibold"
                      >
                        <Plus className="w-6 h-6" />
                        <span>Add First Frame Product</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-green-800 font-medium">
                        ✅ You have {products.length} frame(s) available in your shop. Customers can now browse and purchase these frames.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-4 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto shadow-lg text-lg font-semibold mb-6"
                    >
                      <Plus className="w-6 h-6" />
                      <span>Add Another Frame</span>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <div key={product.id} className="bg-white border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                              <p>Size: {product.size}</p>
                              <p>Finish: {product.material}</p>
                              <p>Colors: {product.category}</p>
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
    </div>
  )
}