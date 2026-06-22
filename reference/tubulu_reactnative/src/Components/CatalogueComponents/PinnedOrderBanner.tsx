import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { ORDER_STATUS_CONFIG } from '../../Utils/Constants';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

interface OrderMessageData {
  type: keyof typeof ORDER_STATUS_CONFIG;
  message: string;
  createdAt: string | number | Date;
  productNames?: string[];
  orderId?: string;
}

interface Props {
  activeOrders: OrderMessageData[];
  onViewDetails?: (orderId: string) => void;
  onClose?: () => void;
}

const PinnedOrderBanner: React.FC<Props> = ({ activeOrders, onViewDetails, onClose }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter out delivered orders
  const filteredOrders = activeOrders?.filter(
    order => order.type !== 'ORDER_DELIVERED'
  ) || [];

  if (!filteredOrders || filteredOrders.length === 0) {
    return null;
  }

  const currentOrder = filteredOrders[0];
  const hasMultipleOrders = filteredOrders.length > 1;
  const config = ORDER_STATUS_CONFIG[currentOrder.type];

  if (!config) return null;

  const formatStatusTitle = (status: string) => {
    return status
      .replace('ORDER_', '')
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const extractOrderId = (message: string, fallbackOrderId?: string) => {
    const boldMatches = Array.from(message.matchAll(/<b>(.*?)<\/b>/g), m => m[1]);
    let orderId = boldMatches[1] || fallbackOrderId || 'N/A';
    // Remove # symbol if present (to avoid double hash)
    if (orderId && orderId.startsWith('#')) {
      orderId = orderId.substring(1);
    }
    return orderId;
  };

  const trimOrderId = (orderId: string, startChars: number = 6, endChars: number = 4): string => {
    if (!orderId || orderId === 'N/A') return orderId;
    // Trim if orderId is longer than 15 characters to prevent clipping
    if (orderId.length <= 15) return orderId;
    const start = orderId.substring(0, startChars);
    const end = orderId.substring(orderId.length - endChars);
    return `${start}⋯${end}`;
  };

  const orderId = extractOrderId(currentOrder.message, currentOrder.orderId);
  const trimmedOrderId = trimOrderId(orderId);

  return (
    <>
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.statusText} numberOfLines={1}>
              {formatStatusTitle(currentOrder.type)}
            </Text>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderIdLabel}>Order</Text>
              <Text style={styles.orderIdValue} numberOfLines={1} ellipsizeMode="tail">
                #{trimmedOrderId}
              </Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => onViewDetails?.(currentOrder.orderId || orderId)}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
            
            {hasMultipleOrders && (
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDropdown(true)}
              >
                <MaterialCommunityIcon
                  name="chevron-down"
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcon
                name="close"
                size={18}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {hasMultipleOrders && (
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDropdown(false)}
          >
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdownHeader}>
                <Text style={styles.dropdownTitle}>Active Orders</Text>
                <TouchableOpacity onPress={() => setShowDropdown(false)}>
                  <MaterialCommunityIcon name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={filteredOrders}
                keyExtractor={(item, index) => `${item.orderId || index}-${item.createdAt}`}
                renderItem={({ item }) => {
                  const itemConfig = ORDER_STATUS_CONFIG[item.type];
                  const itemOrderId = extractOrderId(item.message, item.orderId);
                  const trimmedItemOrderId = trimOrderId(itemOrderId);
                  
                  return (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setShowDropdown(false);
                        onViewDetails?.(item.orderId || itemOrderId);
                      }}
                    >
                      <View style={[styles.dropdownIcon, { backgroundColor: itemConfig.color + '20' }]}>
                        <Text style={styles.dropdownIconText}>{itemConfig.icon}</Text>
                      </View>
                      <View style={styles.dropdownItemText}>
                        <Text style={styles.dropdownItemStatus}>
                          {formatStatusTitle(item.type)}
                        </Text>
                        <View style={styles.dropdownOrderIdContainer}>
                          <Text style={styles.dropdownOrderIdLabel}>Order</Text>
                          <Text style={styles.dropdownOrderIdValue}>#{trimmedItemOrderId}</Text>
                        </View>
                      </View>
                      <MaterialCommunityIcon
                        name="chevron-right"
                        size={20}
                        color="#ccc"
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
    minWidth: 0,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 1,
  },
  orderIdLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    marginRight: 4,
    flexShrink: 0,
  },
  orderIdValue: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 1,
    minWidth: 0,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  viewButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#2563eb',
    borderRadius: 18,
    marginRight: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    flexShrink: 0,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dropdownButton: {
    padding: 6,
    marginRight: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  dropdownTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.3,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  dropdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownIconText: {
    fontSize: 18,
  },
  dropdownItemText: {
    flex: 1,
  },
  dropdownItemStatus: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  dropdownOrderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dropdownOrderIdLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    marginRight: 4,
  },
  dropdownOrderIdValue: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default PinnedOrderBanner;

