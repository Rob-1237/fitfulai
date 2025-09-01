import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlateUtensils } from "@fortawesome/pro-duotone-svg-icons";

function Meals({ isDark }) {
    const [message, setMessage] = useState("Meals...");

    return (
        <motion.div
        className={`${isDark ? 'bg-[var(--color-black)]' : 'bg-[var(--color-white)]'}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <FontAwesomeIcon icon={faPlateUtensils} className="text-orange-500" />
            <h1>{message}</h1>
        </motion.div>
    );
}

export default Meals;