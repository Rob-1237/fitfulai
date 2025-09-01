import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping } from "@fortawesome/pro-duotone-svg-icons";

function Groceries() {
    const [message, setMessage] = useState("Groceries...");

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <FontAwesomeIcon icon={faBasketShopping} className="text-orange-500" />
            <h1>{message}</h1>
        </motion.div>
    );
}

export default Groceries;