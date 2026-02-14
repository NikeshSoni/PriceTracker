"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/app/action";
import { 
  ChevronDownCircle, 
  ChevronUp, 
  ExternalLink, 
  Trash2, 
  TrendingDown, 
  TrendingUp,
  Clock,
  Activity
} from "lucide-react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import PriceChart from "./PriceChart";
import { toast } from "sonner";

// Animation variants
const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.5
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: {
      duration: 0.3
    }
  },
  hover: { 
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

const imageVariants = {
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25
    }
  },
  tap: { scale: 0.98 }
};

const chartVariants = {
  hidden: { 
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  visible: { 
    opacity: 1,
    height: "auto",
    marginTop: 16,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function ProductCard({ product }) {
  const [showChart, setShowChart] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Simulate price trend (you can replace with actual data)
  const priceTrend = Math.random() > 0.5 ? 'up' : 'down';
  const trendColor = priceTrend === 'up' ? 'text-red-500' : 'text-green-600';
  const TrendIcon = priceTrend === 'up' ? TrendingUp : TrendingDown;

  const performDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteProduct(product.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message || "Product removed from tracking.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    toast.error("Do you want to remove this product from tracking?", {
      action: {
        label: "Remove",
        onClick: performDelete,
      },
      cancel: {
        label: "Cancel",
      },
    });
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
        {/* Subtle orange accent on hover */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"
          initial={{ height: 0 }}
          animate={{ height: isHovered ? "100%" : 0 }}
          transition={{ duration: 0.3 }}
        />

        <CardHeader className="pb-3 relative">
          <div className="flex gap-4 items-start">
            {product.image_url && (
              <motion.div
                variants={imageVariants}
                whileHover="hover"
                className="relative overflow-hidden rounded-md shadow-sm"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-md border border-gray-200"
                />
              </motion.div>
            )}

            <div className="flex-1 min-w-0">
              <motion.div
                animate={{ x: isHovered ? 2 : 0 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 text-lg">
                  {product.name}
                </h3>
              </motion.div>
              
              {/* Last updated info */}
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Updated 2 min ago</span>
                </div>
                
                <motion.div
                  animate={{
                    scale: isHovered ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: isHovered ? Infinity : 0,
                  }}
                >
                  <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                </motion.div>
              </motion.div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <motion.div 
                className="flex items-baseline gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-2xl font-bold text-orange-500">
                  {product.currency} {product.current_price}
                </span>

                <Badge 
                  variant="secondary" 
                  className="gap-1 bg-orange-50 text-orange-600 border-orange-200 font-normal text-xs"
                >
                  <Activity className="w-3 h-3" />
                  Track
                </Badge>
              </motion.div>

              {/* Price change indicator */}
              <motion.p 
                className={`text-xs ${trendColor} font-medium`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {priceTrend === 'up' ? '▲' : '▼'} 2.4%
              </motion.p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <motion.div 
            className="flex flex-wrap gap-2"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setShowChart(!showChart)}
              >
                <motion.div
                  animate={{ rotate: showChart ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {showChart ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDownCircle className="w-4 h-4" />
                  )}
                </motion.div>
                {showChart ? "Hide Chart" : "Show Chart"}
              </Button>
            </motion.div>

            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="gap-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <Link href={product.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  View
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                variant="ghost"
                size="sm"
                disabled={deleting}
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
              >
                <motion.div
                  animate={deleting ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.div>
                {deleting ? "Removing..." : "Remove"}
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>

        <AnimatePresence mode="wait">
          {showChart && (
            <motion.div
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <CardFooter className="pt-0">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-full border-t border-gray-100 pt-4"
                >
                  <PriceChart productId={product.id} />
                </motion.div>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}