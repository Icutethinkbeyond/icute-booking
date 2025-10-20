// // contexts/ProductServiceListContext.tsx
// import { toNumber } from "lodash";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   ReactNode,
//   useEffect,
// } from "react";
// import { calculateFooterTotals, calculateTax } from "@/utils/utils";

// // กำหนดประเภทของสินค้าย่อย
// export interface SubProduct {
//   isSubjectItem: boolean;
//   productServiceKey: number;
//   productService: string;
//   description: string;
//   amount: number;
//   price: number;
//   discount: number;
//   total: number;
//   subProductServiceNumber: number;
// }

// //กำหนดประเภทของ footer
// export interface FormDataFooter {
//   total: number;
//   discountPrice: number;
//   priceAfterDiscount: number;
//   includeVat: boolean;
//   vatPrice: number;
//   totalAmount: number;
//   withholdingTax: number;
//   withholdingTaxPrice: number;
//   totalAmountDue: number;
// }

// // กำหนดประเภทของสินค้า
// export interface Product {
//   isSubjectItem: boolean;
//   productService: string;
//   description: string;
//   amount: number;
//   price: number;
//   discount: number;
//   total: number;
//   productServiceNumber: number;
//   subProductList: SubProduct[];
//   totalAmount: number;
//   totalPrice: number;
//   totalDiscount: number;
//   sumTotal: number;
//   totalAmountDue: number;
// }

// export interface HeadForm {
//   quotationNumber: string;
//   companyName: string;
//   companyTel: string;
//   contactorName: string;
//   contactorTel: string;
//   companyAddress: string;
//   contactorAddress: string;
//   contactorEmail: string;
//   taxId: string;
//   branch: string;
//   dateCreate: string;
//   includeTax: boolean;
//   note: string;
// }

// export const productClean = {
//   isSubjectItem: true,
//   productServiceNumber: 0,
//   productService: "",
//   description: "",
//   price: 0,
//   amount: 0,
//   discount: 0,
//   total: 0,
//   subProductList: [],
//   totalAmount: 0,
//   totalPrice: 0,
//   totalDiscount: 0,
//   sumTotal: 0,
//   totalAmountDue: 0,
// };

// export const subProductClean = {
//   isSubjectItem: false,
//   subProductServiceNumber: 0,
//   productService: "",
//   description: "",
//   price: 0,
//   amount: 0,
//   discount: 0,
//   total: 0,
//   productServiceKey: 0,
// };

// export const footerFormClean = {
//   total: 0,
//   discountPrice: 0,
//   priceAfterDiscount: 0,
//   includeVat: false,
//   vatPrice: 0,
//   totalAmount: 0,
//   withholdingTax: 0,
//   withholdingTaxPrice: 0,
//   totalAmountDue: 0,
// };

// export const headerClean = {
//   quotationNumber: "",
//   companyName: "",
//   companyTel: "",
//   contactorName: "",
//   contactorTel: "",
//   companyAddress: "",
//   contactorAddress: "",
//   contactorEmail: "",
//   taxId: "",
//   branch: "",
//   dateCreate: "",
//   includeTax: false,
//   note: "",
// }

// // กำหนดประเภทของ Context
// interface ProductServiceListContextProps {
//   products: Product[];
//   setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
//   addProduct: (product: Product) => void;
//   removeProduct: (productServiceNumber: number) => void;
//   updateProduct: (updatedProduct: Product) => void;
//   addSubProduct: (productServiceNumber: number, subProduct: SubProduct) => void;
//   removeSubProduct: (
//     productServiceNumber: number,
//     subProductServiceNumber: number
//   ) => void;
//   updateSubProduct: (
//     productServiceNumber: number,
//     updatedSubProduct: SubProduct
//   ) => void;

//   //สินค้า
//   productEdit: Product;
//   setProductEdit: React.Dispatch<React.SetStateAction<Product>>;
//   subProductEdit: SubProduct;
//   setSubProductEdit: React.Dispatch<React.SetStateAction<SubProduct>>;

//   isProductEdit: boolean;
//   setIsProductEdit: React.Dispatch<React.SetStateAction<boolean>>;
//   isSubProductEdit: boolean;
//   setIsSubProductEdit: React.Dispatch<React.SetStateAction<boolean>>;

//   //ส่วนท้ายเอกสาร
//   footerForm: FormDataFooter;
//   setFooterForm: React.Dispatch<React.SetStateAction<FormDataFooter>>;
  
//   //ส่วนหัวเอกสาร
//   headForm: HeadForm;
//   setHeadForm: React.Dispatch<React.SetStateAction<HeadForm>>;
// }

// // สร้าง Context
// const ProductServiceListContext = createContext<
//   ProductServiceListContextProps | undefined
// >(undefined);

// export const ProductsProvider = ({ children }: { children: ReactNode }) => {

//   const [products, setProducts] = useState<Product[]>([]);
//   const [footerForm, setFooterForm] = useState<FormDataFooter>(footerFormClean);
//   const [productEdit, setProductEdit] = useState<Product>(productClean);
//   const [headForm, setHeadForm] = useState<HeadForm>(headerClean);
//   const [subProductEdit, setSubProductEdit] =
//     useState<SubProduct>(subProductClean);
//   const [isProductEdit, setIsProductEdit] = useState<boolean>(false);
//   const [isSubProductEdit, setIsSubProductEdit] = useState<boolean>(false);


//   // Function to calculate totals
//   const calculateTotals = (products: Product[]): Product[] => {

//     return products.map((product) => {
//       const totalAmount = product.subProductList.reduce(
//         (sum, subProduct) => sum + subProduct.amount,
//         product.amount
//       );

//       const totalPrice = product.subProductList.reduce(
//         (sum, subProduct) => sum + subProduct.price * subProduct.amount,
//         product.price * product.amount
//       );

//       const totalDiscount = product.subProductList.reduce(
//         (sum, subProduct) => sum + subProduct.discount,
//         product.discount
//       );

//       const sumTotal = product.subProductList.reduce(
//         (sum, subProduct) => sum + subProduct.total,
//         product.total
//       );

//       const totalAmountDue = sumTotal - totalDiscount;

//       // Only update the product if the totals have changed
//       if (
//         totalAmount !== product.totalAmount ||
//         totalPrice !== product.totalPrice ||
//         totalDiscount !== product.totalDiscount ||
//         totalAmountDue !== product.totalAmountDue
//       ) {
//         return {
//           ...product,
//           totalAmount,
//           totalPrice,
//           totalDiscount,
//           totalAmountDue,
//           sumTotal,
//         };
//       }

//       return product;
//     });
//   };

//   // Update totals whenever products change
//   useEffect(() => {
//     const updatedProducts = calculateTotals(products);
//     const { totalPrice, totalDiscount, priceAfterDiscount } =
//       calculateFooterTotals(products);

//     setFooterForm({
//       ...footerForm,
//       total: totalPrice,
//       discountPrice: totalDiscount,
//       priceAfterDiscount: priceAfterDiscount,
//     });

//     // Check if there are any differences before setting the state
//     if (JSON.stringify(products) !== JSON.stringify(updatedProducts)) {
//       setProducts(updatedProducts);
//     }

//     // console.log(products);
//   }, [products]);

//   useEffect(() => {
//     let vatRate = footerForm.includeVat ? 0.07 : 0;

//     const {
//       totalWithVAT,
//       vatAmount,
//       withholdingTaxAmount,
//       totalAfterWithholdingTax,
//     } = calculateTax(
//       footerForm.priceAfterDiscount,
//       vatRate,
//       footerForm.withholdingTax
//     );

//     // // Only update state if the calculated values are different
//     if (
//       vatAmount !== footerForm.vatPrice ||
//       totalWithVAT !== footerForm.totalAmount ||
//       withholdingTaxAmount !== footerForm.withholdingTaxPrice ||
//       totalAfterWithholdingTax !== footerForm.withholdingTaxPrice
//     ) {
//       setFooterForm((prevForm) => ({
//         ...prevForm,
//         vatPrice: vatAmount,
//         totalAmount: totalWithVAT,
//         withholdingTaxPrice: withholdingTaxAmount,
//         totalAmountDue: totalAfterWithholdingTax,
//       }));
//     }
//   }, [
//     footerForm.includeVat,
//     footerForm.priceAfterDiscount,
//     footerForm.withholdingTax,
//   ]);

//   // ฟังก์ชันสำหรับเพิ่มสินค้า
//   const addProduct = (product: Product) => {
//     setProducts((prevProducts) => [...prevProducts, product]);
//   };

//   // ฟังก์ชันสำหรับลบสินค้า
//   const removeProduct = (productServiceNumber: number) => {
//     setProducts((prevProducts) =>
//       prevProducts.filter(
//         (product) => product.productServiceNumber !== productServiceNumber
//       )
//     );
//   };

//   // ฟังก์ชันสำหรับอัปเดตสินค้า
//   const updateProduct = (updatedProduct: Product) => {
//     setProducts((prevProducts) =>
//       prevProducts.map((product) =>
//         product.productServiceNumber === updatedProduct.productServiceNumber
//           ? updatedProduct
//           : product
//       )
//     );
//   };

//   // ฟังก์ชันสำหรับเพิ่มสินค้าย่อย
//   const addSubProduct = (
//     productServiceNumber: number,
//     subProduct: SubProduct
//   ) => {
//     setProducts((prevProducts) =>
//       prevProducts.map((product) =>
//         toNumber(product.productServiceNumber) === productServiceNumber
//           ? {
//               ...product,
//               subProductList: [...product.subProductList, subProduct],
//             }
//           : product
//       )
//     );
//   };

//   // ฟังก์ชันสำหรับลบสินค้าย่อย
//   const removeSubProduct = (
//     productServiceNumber: number,
//     subProductServiceNumber: number
//   ) => {
//     console.log(productServiceNumber, subProductServiceNumber);
//     setProducts((prevProducts) =>
//       prevProducts.map((product) =>
//         product.productServiceNumber === productServiceNumber
//           ? {
//               ...product,
//               subProductList: product.subProductList.filter(
//                 (subProduct) =>
//                   subProduct.subProductServiceNumber !== subProductServiceNumber
//               ),
//             }
//           : product
//       )
//     );
//   };

//   // ฟังก์ชันสำหรับอัปเดตสินค้าย่อย
//   const updateSubProduct = (
//     productServiceNumber: number,
//     updatedSubProduct: SubProduct
//   ) => {
//     setProducts((prevProducts) =>
//       prevProducts.map((product) =>
//         product.productServiceNumber === productServiceNumber
//           ? {
//               ...product,
//               subProductList: product.subProductList.map((subProduct) =>
//                 subProduct.subProductServiceNumber ===
//                 updatedSubProduct.subProductServiceNumber
//                   ? updatedSubProduct
//                   : subProduct
//               ),
//             }
//           : product
//       )
//     );
//   };

//   return (
//     <ProductServiceListContext.Provider
//       value={{
//         products,
//         setProducts,
//         addProduct,
//         removeProduct,
//         updateProduct,
//         addSubProduct,
//         removeSubProduct,
//         updateSubProduct,
//         productEdit,
//         setProductEdit,
//         subProductEdit,
//         setSubProductEdit,
//         isProductEdit,
//         setIsProductEdit,
//         isSubProductEdit,
//         setIsSubProductEdit,
//         footerForm,
//         setFooterForm,
//         headForm,
//         setHeadForm
//       }}
//     >
//       {children}
//     </ProductServiceListContext.Provider>
//   );
// };

// // Hook สำหรับใช้ Context
// export const useProductServiceListContext = () => {
//   const context = useContext(ProductServiceListContext);
//   if (!context) {
//     throw new Error(
//       "useProductServiceListContext must be used within a ProductsProvider"
//     );
//   }
//   return context;
// };
