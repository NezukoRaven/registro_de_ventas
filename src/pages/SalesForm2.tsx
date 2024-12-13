import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: number;
}

interface SelectedProduct extends Product {
    quantity: number;
    total: number;
}

interface SalesFormProps {
    onBack: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ onBack }) => {
    const productList: Product[] = [
        { id: 1, name: 'Papel Couche', price: 400 },
        { id: 2, name: 'Papel Normal', price: 300 },
        { id: 3, name: 'Aro', price: 9000 },
        { id: 4, name: 'Pilas', price: 200 },
        { id: 5, name: 'Sobre Pequeño', price: 300 },
        { id: 6, name: 'Sobre Mediano', price: 500 },
        { id: 7, name: 'Sobre Grande', price: 1000 },
        { id: 8, name: 'Scotch', price: 200 },
        { id: 9, name: 'Cinta Chica', price: 200 },
        { id: 10, name: 'Cinta Grande', price: 300 },
        { id: 11, name: 'Nieves', price: 600 },
        { id: 12, name: 'Rosas', price: 200 },
        { id: 13, name: 'Dino Grande', price: 9000 },
        { id: 14, name: 'Dino Chico', price: 6000 },
        { id: 15, name: 'Tarjetas', price: 200 },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(() => {
        // Intentar cargar los productos guardados al iniciar
        const saved = localStorage.getItem('selectedProducts');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);

    // Guardar productos en localStorage cada vez que cambien
    useEffect(() => {
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    }, [selectedProducts]);

    const filteredProducts = productList.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const calculateTotal = (quantity: number, price: number): number => {
        if (quantity >= 3) {
            const setsOfThree = Math.floor(quantity / 3);
            const remainder = quantity % 3;
            return (setsOfThree * 1000) + (remainder * price);
        }
        return quantity * price;
    };

    const addProduct = () => {
        if (selectedProduct) {
            const total = calculateTotal(quantity, selectedProduct.price);
            setSelectedProducts([
                ...selectedProducts,
                {
                    ...selectedProduct,
                    quantity,
                    total
                }
            ]);
            setSelectedProduct(null);
            setQuantity(1);
        }
    };

    // Función para limpiar todas las ventas
    const clearSales = () => {
        setSelectedProducts([]);
        localStorage.removeItem('selectedProducts');
    };

    const totalVenta = selectedProducts.reduce((acc, product) => acc + product.total, 0);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={onBack}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle>Formulario de Ventas</CardTitle>
                    </div>
                    {selectedProducts.length > 0 && (
                        <Button 
                            variant="destructive" 
                            onClick={clearSales}
                        >
                            Limpiar Ventas
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                        <Search className="w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4 max-h-64 overflow-y-auto">
                        {filteredProducts.map(product => (
                            <div
                                key={product.id}
                                className={`p-2 border rounded cursor-pointer ${
                                    selectedProduct?.id === product.id ? 'bg-blue-100 border-blue-500' : ''
                                }`}
                                onClick={() => setSelectedProduct(product)}
                            >
                                {product.name} - ${product.price}
                            </div>
                        ))}
                    </div>

                    {selectedProduct && (
                        <div className="flex gap-2 mb-4">
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="w-24"
                            />
                            <Button onClick={addProduct}>Agregar</Button>
                        </div>
                    )}

                    {selectedProducts.length > 0 && (
                        <>
                            <table className="w-full mb-4">
                                <thead>
                                    <tr>
                                        <th className="text-left">Producto</th>
                                        <th className="text-right">Cantidad</th>
                                        <th className="text-right">Precio</th>
                                        <th className="text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProducts.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product.name}</td>
                                            <td className="text-right">{product.quantity}</td>
                                            <td className="text-right">${product.price}</td>
                                            <td className="text-right">${product.total}</td>
                                        </tr>
                                    ))}
                                    <tr className="font-bold">
                                        <td colSpan={3} className="text-right">Total Venta:</td>
                                        <td className="text-right">${totalVenta}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesForm;