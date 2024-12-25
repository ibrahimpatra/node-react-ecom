const ProductPage = ({ product }) => (
    <div>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p>Price: ${product.price}</p>
        <img src={product.image} alt={product.name} />
    </div>
);

export default ProductPage;