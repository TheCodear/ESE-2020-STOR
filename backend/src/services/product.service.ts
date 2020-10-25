import { Product, ProductAttributes } from './../models/product.model';

export class ProductService {

    public create(product: ProductAttributes): Promise<ProductAttributes> {
        return(Product.create(product))
            .then(inserted => Promise.resolve(inserted).catch(err => Promise.reject(err)));
    }

    public update(productId: number, product: ProductAttributes): Promise<ProductAttributes> {
        return Product.findByPk(productId).then((isFound) => isFound.update(product)
        .then(() => {
            return Promise.resolve(isFound);
        }).catch(err => Promise.reject(err)));
        }



    public getProduct(productId: number): Promise<Product> {
        return Product.findByPk(productId);
    }


    public getProductsOfCategory(category: string): Promise<Product[]> {
        const { Op } = require('sequelize');
        return Product.findAll({
            where: {
              [Op.and]: [
                { productCategory: category }
              ]
            }
        });
    }

    public getAll(): Promise<Product[]> {
        return Product.findAll();
    }

    public getAllApproved(): Promise<Product[]> {
        return Product.findAll({
            where: {
                isApproved: true
            },
        });
    }

    public getAllUnapproved(): Promise<Product[]> {
        return Product.findAll({
            where: {
                isApproved: false
            },
        });
    }

    public deleteProduct(id: number): Promise<Product> {
        return Product.findByPk(id)
        .then(isFound =>  isFound.destroy()
            .then(() => Promise.resolve(isFound))
            .catch(err => Promise.reject(err)));
    }
}
