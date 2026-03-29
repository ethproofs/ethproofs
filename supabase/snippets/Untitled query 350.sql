DELETE FROM drizzle.__drizzle_migrations                                                                           
  WHERE tag IN (                                                                                                     
    '0058_add-error-proof-status',                                                                                   
    '0059_exclude-error-from-missing-proofs',                                                                        
    '0060_add-error-status-column'                                                                                   
  );